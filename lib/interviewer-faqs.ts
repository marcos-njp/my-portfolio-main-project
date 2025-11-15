/**
 * FAQ Query Patterns - Guidelines for AI (NOT hardcoded responses)
 * 
 * These are CONTEXT HINTS to help the AI understand common questions
 * The AI should use RAG/vector database to formulate actual responses
 */

export interface FAQPattern {
  category: string;
  question: string;
  keywords: string[];
  contextHint: string; // What topic to focus on from RAG
  relevance_boost: number;
}

export const FAQ_PATTERNS: FAQPattern[] = [
  // Introduction & Background
  {
    category: "introduction",
    question: "Tell me about yourself",
    keywords: ["about yourself", "introduce yourself", "who are you", "background", "tell me about"],
    contextHint: "Focus on: personal profile, education, key achievements, current role as IT student",
    relevance_boost: 0.95
  },
  {
    category: "introduction",
    question: "Why should we hire you?",
    keywords: ["why hire", "why should we", "what makes you", "why you"],
    contextHint: "Focus on: unique strengths, competition achievements, deployed projects, technical skills",
    relevance_boost: 0.95
  },
  {
    category: "introduction",
    question: "What are your career goals?",
    keywords: ["career goals", "future plans", "where do you see yourself", "aspirations"],
    contextHint: "Focus on: career_goals section, learning focus, industries interested in",
    relevance_boost: 0.9
  },

  // Technical Skills
  {
    category: "technical",
    question: "What programming languages do you know?",
    keywords: ["programming languages", "languages", "what languages"],
    contextHint: "Focus on: programming_languages from skills section with years and proficiency",
    relevance_boost: 0.95
  },
  {
    category: "technical",
    question: "What frameworks and technologies?",
    keywords: ["frameworks", "technologies", "tech stack", "tools"],
    contextHint: "Focus on: frontend, backend, databases, ai_ml tools from technical skills",
    relevance_boost: 0.95
  },

  // Projects
  {
    category: "projects",
    question: "Tell me about your projects",
    keywords: ["projects", "what have you built", "portfolio", "applications"],
    contextHint: "Focus on: projects_portfolio with specific details, technologies, live demos",
    relevance_boost: 0.93
  },
  {
    category: "projects",
    question: "Most challenging project",
    keywords: ["challenging project", "difficult project", "hardest project"],
    contextHint: "Focus on: AI-Powered RAG system project and STAR achievements",
    relevance_boost: 0.9
  },

  // Achievements
  {
    category: "achievements",
    question: "What are your biggest achievements?",
    keywords: ["achievements", "accomplishments", "awards", "proud of"],
    contextHint: "Focus on: competition_achievements and technical_achievements metrics",
    relevance_boost: 0.95
  },

  // Work Preferences
  {
    category: "work_preferences",
    question: "What type of role are you looking for?",
    keywords: ["looking for", "seeking", "role", "position"],
    contextHint: "Focus on: career_goals, industries_interested, current_status",
    relevance_boost: 0.9
  },
  {
    category: "work_preferences",
    question: "Salary expectations",
    keywords: ["salary", "compensation", "pay", "rate"],
    contextHint: "Focus on: salary_expectations from salary_location section",
    relevance_boost: 0.8
  },
];

/**
 * Find relevant FAQ patterns to enhance query context
 * Returns context hints, NOT hardcoded responses
 */
export function findRelevantFAQPatterns(query: string, topK = 2): FAQPattern[] {
  const lowerQuery = query.toLowerCase();

  const scored = FAQ_PATTERNS.map((pattern) => {
    let score = 0;

    // Keyword matching
    const keywordMatches = pattern.keywords.filter((keyword) =>
      lowerQuery.includes(keyword.toLowerCase())
    ).length;
    
    score += keywordMatches * 0.3;

    // Question similarity (simple word overlap)
    const queryWords = lowerQuery.split(/\s+/);
    const questionWords = pattern.question.toLowerCase().split(/\s+/);
    const overlap = queryWords.filter((word) => questionWords.includes(word)).length;
    
    score += overlap * 0.2;

    // Boost score
    score *= pattern.relevance_boost;

    return { pattern, score };
  });

  // Return top matching patterns
  return scored
    .filter(({ score }) => score > 0.3) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ pattern }) => pattern);
}
