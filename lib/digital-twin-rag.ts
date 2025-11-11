import { Index } from '@upstash/vector';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import digitaltwinData from '@/digitaltwin.json';

// Initialize Upstash Vector Index
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Initialize Groq
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface ContentChunk {
  id: string;
  title: string;
  type: string;
  content: string;
  metadata: {
    category: string;
    tags: string[];
  };
}

interface VectorQueryResult {
  id: string;
  score: number;
  metadata?: {
    title?: string;
    content?: string;
    type?: string;
    category?: string;
    tags?: string[];
  };
  data?: string;
}

/**
 * Transform digitaltwin.json into content chunks for vector storage
 */
function createContentChunks(profileData: typeof digitaltwinData): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let chunkId = 1;

  // Personal information
  const personal = profileData.personal || {};
  chunks.push({
    id: `chunk_${chunkId++}`,
    title: 'Personal Information',
    type: 'personal',
    content: `Name: ${personal.name}. Title: ${personal.title}. Location: ${personal.location}. Summary: ${personal.summary}. Elevator pitch: ${personal.elevator_pitch}. Contact: Email ${personal.contact?.email}, LinkedIn ${personal.contact?.linkedin}, GitHub ${personal.contact?.github}`,
    metadata: { category: 'about', tags: ['personal', 'contact', 'overview'] },
  });

  // Salary and location preferences
  const salaryLoc = profileData.salary_location || {};
  chunks.push({
    id: `chunk_${chunkId++}`,
    title: 'Salary and Location Preferences',
    type: 'preferences',
    content: `Current status: ${salaryLoc.current_status}. Salary expectations: ${salaryLoc.salary_expectations}. Location preferences: ${salaryLoc.location_preferences?.join(', ')}. Relocation willing: ${salaryLoc.relocation_willing}. Remote experience: ${salaryLoc.remote_experience}. Travel availability: ${salaryLoc.travel_availability}. Work authorization: ${salaryLoc.work_authorization}`,
    metadata: { category: 'preferences', tags: ['salary', 'location', 'remote'] },
  });

  // Experience with STAR achievements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (profileData.experience || []).forEach((exp: any) => {
    const expContent = `Company: ${exp.company}. Title: ${exp.title}. Duration: ${exp.duration}. Context: ${exp.company_context}. Team structure: ${exp.team_structure}. Technical skills used: ${exp.technical_skills_used?.join(', ')}.`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exp.achievements_star?.forEach((achievement: any, i: number) => {
      const starContent = `Situation: ${achievement.situation} Task: ${achievement.task} Action: ${achievement.action} Result: ${achievement.result}`;
      chunks.push({
        id: `chunk_${chunkId++}`,
        title: `${exp.title} at ${exp.company} - Achievement ${i + 1}`,
        type: 'experience',
        content: `${expContent} ${starContent}`,
        metadata: { category: 'experience', tags: ['work', 'achievement', 'STAR'] },
      });
    });
  });

  // Technical Skills
  const skills = profileData.skills || {};
  const technical = skills.technical || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progLangs = (technical.programming_languages || []).map((lang: any) =>
    `${lang.language} (${lang.proficiency} - ${lang.years} years) with frameworks: ${lang.frameworks?.join(', ')}`
  );

  chunks.push({
    id: `chunk_${chunkId++}`,
    title: 'Technical Skills',
    type: 'skills',
    content: `Programming Languages: ${progLangs.join('. ')}. Databases: ${technical.databases?.join(', ')}. Cloud platforms: ${technical.cloud_platforms?.join(', ')}. Frontend: ${technical.frontend?.join(', ')}. Backend: ${technical.backend?.join(', ')}. AI/ML: ${technical.ai_ml?.join(', ')}. Soft skills: ${skills.soft_skills?.join(', ')}`,
    metadata: { category: 'skills', tags: ['technical', 'programming', 'expertise'] },
  });

  // Education
  const education = profileData.education || {};
  chunks.push({
    id: `chunk_${chunkId++}`,
    title: 'Education',
    type: 'education',
    content: `University: ${education.university}. Degree: ${education.degree}. Expected graduation: ${education.graduation_year}. Location: ${education.location}. Status: ${education.status}. Relevant coursework: ${education.relevant_coursework?.join(', ')}. Previous education: ${education.previous_education}`,
    metadata: { category: 'education', tags: ['academic', 'university', 'coursework'] },
  });

  // Projects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (profileData.projects_portfolio || []).forEach((project: any) => {
    chunks.push({
      id: `chunk_${chunkId++}`,
      title: `Project: ${project.name}`,
      type: 'project',
      content: `Name: ${project.name}. Description: ${project.description}. Technologies: ${project.technologies?.join(', ')}. Impact: ${project.impact}. GitHub: ${project.github_url}. Live demo: ${project.live_demo}. Key features: ${project.key_features?.join(', ')}`,
      metadata: { category: 'projects', tags: ['portfolio', 'development', 'showcase'] },
    });
  });

  // Career goals
  const careerGoals = profileData.career_goals || {};
  chunks.push({
    id: `chunk_${chunkId++}`,
    title: 'Career Goals',
    type: 'career',
    content: `Short-term goals: ${careerGoals.short_term}. Long-term goals: ${careerGoals.long_term}. Learning focus: ${careerGoals.learning_focus?.join(', ')}. Industries interested: ${careerGoals.industries_interested?.join(', ')}`,
    metadata: { category: 'career', tags: ['goals', 'aspirations', 'growth'] },
  });

  // Achievements
  const achievements = profileData.achievements_metrics || {};
  chunks.push({
    id: `chunk_${chunkId++}`,
    title: 'Achievements and Metrics',
    type: 'achievements',
    content: `Competition achievements: ${achievements.competition_achievements?.join(', ')}. Technical achievements: ${achievements.technical_achievements?.join(', ')}. Personal metrics: ${achievements.personal_metrics?.join(', ')}`,
    metadata: { category: 'achievements', tags: ['accomplishments', 'metrics', 'competitions'] },
  });

  return chunks;
}

/**
 * Initialize vector database with profile data
 */
export async function initializeVectorDatabase() {
  try {
    // Check if database is already populated
    const info = await vectorIndex.info();
    const vectorCount = info.vectorCount || 0;

    if (vectorCount > 0) {
      console.log(`✅ Vector database already has ${vectorCount} vectors`);
      return { success: true, message: 'Database already initialized', count: vectorCount };
    }

    // Create content chunks from digitaltwin.json
    const chunks = createContentChunks(digitaltwinData);

    // Prepare vectors for upsert
    const vectors = chunks.map((chunk) => ({
      id: chunk.id,
      data: `${chunk.title}: ${chunk.content}`,
      metadata: {
        title: chunk.title,
        type: chunk.type,
        content: chunk.content,
        category: chunk.metadata.category,
        tags: chunk.metadata.tags,
      },
    }));

    // Upload to Upstash Vector
    await vectorIndex.upsert(vectors);

    console.log(`✅ Successfully uploaded ${vectors.length} content chunks`);
    return { success: true, message: 'Database initialized', count: vectors.length };
  } catch (error) {
    console.error('Error initializing vector database:', error);
    throw error;
  }
}

/**
 * Query vector database for relevant context
 */
export async function queryVectorDatabase(query: string, topK: number = 3) {
  try {
    const results = await vectorIndex.query({
      data: query,
      topK,
      includeMetadata: true,
    });

    return results;
  } catch (error) {
    console.error('Error querying vector database:', error);
    throw error;
  }
}

/**
 * Generate RAG response using Groq
 */
export async function generateRAGResponse(
  question: string,
  model: string = 'llama-3.1-8b-instant'
) {
  try {
    // Step 1: Query vector database
    const vectorResults = await queryVectorDatabase(question, 3);

    // Step 2: Extract relevant content
    const context = vectorResults
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((result: any) => {
        const metadata = result.metadata || {};
        return `${metadata.title}: ${metadata.content}`;
      })
      .join('\n\n');

    // Step 3: Generate response with Groq
    const systemPrompt = `You are an AI digital twin representing Niño Marcos. Answer questions as if you are the person, speaking in first person about your background, skills, and experience. Be professional, confident, and highlight your strengths.

Based on the following information about yourself, answer the question.

Your Information:
${context}

Provide a helpful, professional response that directly addresses the question.`;

    const { text } = await generateText({
      model: groq(model),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.7,
    });

    return {
      success: true,
      response: text,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: vectorResults.map((r: any) => ({
        title: r.metadata?.title,
        score: r.score,
      })),
    };
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw error;
  }
}
