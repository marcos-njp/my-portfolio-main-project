/**
 * OPTIMIZED Query Validation - Professional Context Detection
 * Validates queries are relevant to professional/career topics
 * KEPT: Essential for filtering out irrelevant questions
 */

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  category?: string;
  confidence: number;
}

// Professional keywords - OPTIMIZED and expanded
const PROFESSIONAL_KEYWORDS = [
  // Technical - Core
  'programming', 'code', 'coding', 'development', 'developer', 'software', 'web', 'app', 'application',
  'frontend', 'backend', 'fullstack', 'full-stack', 'database', 'api', 'framework', 'library',
  
  // Languages & Tools
  'javascript', 'typescript', 'python', 'java', 'react', 'next.js', 'nextjs', 'node', 'nodejs',
  'git', 'github', 'vercel', 'deployment', 'deploy', 'testing', 'debug', 'debugging',
  
  // Projects & Work
  'project', 'portfolio', 'built', 'build', 'created', 'create', 'developed', 'develop', 'deployed',
  'work', 'experience', 'internship', 'ojt', 'job', 'role', 'position', 'responsibility',
  
  // Skills
  'skill', 'skills', 'knowledge', 'proficiency', 'expertise', 'ability', 'familiar', 'experienced',
  'proficient', 'advanced', 'beginner', 'intermediate', 'learn', 'learning',
  
  // Education
  'education', 'university', 'college', 'degree', 'graduate', 'student', 'study', 'course',
  
  // Achievements
  'achievement', 'award', 'competition', 'contest', 'certificate', 'accomplishment',
  
  // Career
  'interview', 'hire', 'hiring', 'salary', 'compensation', 'pay', 'remote', 'location',
  'career', 'goal', 'ambition', 'future', 'plan', 'strength', 'weakness', 'challenge',
  
  // Personal Professional
  'about', 'yourself', 'who', 'background', 'introduction', 'tell', 'describe', 'explain',
  
  // Tech Stack (Niño-specific)
  'oauth', 'prisma', 'postgresql', 'groq', 'upstash', 'vector', 'rag', 'ai', 'ml',
  'tailwind', 'framer', 'motion', 'laravel', 'php', 'mysql',
];

// Irrelevant keywords - OPTIMIZED
const IRRELEVANT_KEYWORDS = [
  // Personal/Private (keep these)
  'girlfriend', 'boyfriend', 'dating', 'relationship', 'family', 'parents', 'sibling', 'father', 'mother',
  'home address', 'phone number', 'bank', 'credit card', 'password', 'ssn', 'social security',
  
  // Inappropriate (keep these)
  'hack', 'illegal', 'cheat', 'steal', 'pirate', 'crack', 'bypass',
  
  // Off-topic (keep selective ones)
  'weather', 'sports score', 'politics', 'religion', 'celebrity gossip',
  'recipe', 'cooking', 'medical advice', 'legal advice', 'financial advice', 'investment',
];

/**
 * OPTIMIZED: Validate if query is professionally relevant
 */
export function validateQuery(query: string): ValidationResult {
  const queryLower = query.toLowerCase().trim();
  
  // Empty query check
  if (!queryLower || queryLower.length < 2) {
    return {
      isValid: false,
      reason: "Query too short. Please ask about my experience, skills, or projects.",
      confidence: 1.0
    };
  }
  
  // Greetings are valid
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo'];
  if (greetings.includes(queryLower)) {
    return {
      isValid: true,
      category: 'greeting',
      confidence: 1.0
    };
  }
  
  // Check for system manipulation attempts
  const manipulationPatterns = [
    'ignore previous', 'ignore all', 'forget everything', 'system prompt',
    'act as', 'pretend to be', 'jailbreak', 'bypass', 'override'
  ];
  
  if (manipulationPatterns.some(pattern => queryLower.includes(pattern))) {
    return {
      isValid: false,
      reason: "I'm designed to discuss my professional background. Please ask about my skills, projects, or experience.",
      confidence: 0.98
    };
  }
  
  // Check for clearly irrelevant topics
  const hasIrrelevantKeywords = IRRELEVANT_KEYWORDS.some(keyword => 
    queryLower.includes(keyword.toLowerCase())
  );
  
  if (hasIrrelevantKeywords) {
    return {
      isValid: false,
      reason: "I focus on professional topics. Ask about my technical skills, projects, education, or career goals.",
      confidence: 0.95
    };
  }
  
  // Count professional keyword matches
  const professionalMatches = PROFESSIONAL_KEYWORDS.filter(keyword => 
    queryLower.includes(keyword.toLowerCase())
  ).length;
  
  // Question patterns
  const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can', 'do', 'are', 'is', 'have', 'tell', 'describe', 'explain'];
  const hasQuestionPattern = questionWords.some(word => queryLower.includes(word));
  
  // Calculate confidence based on matches
  let confidence = 0.5;
  if (professionalMatches >= 3) confidence = 0.95;
  else if (professionalMatches >= 2) confidence = 0.85;
  else if (professionalMatches >= 1) confidence = 0.75;
  else if (hasQuestionPattern) confidence = 0.65;
  
  // Determine category
  let category = 'general';
  if (queryLower.includes('skill') || queryLower.includes('programming') || queryLower.includes('language')) {
    category = 'technical_skills';
  } else if (queryLower.includes('project') || queryLower.includes('built') || queryLower.includes('portfolio')) {
    category = 'projects';
  } else if (queryLower.includes('education') || queryLower.includes('university')) {
    category = 'education';
  } else if (queryLower.includes('experience') || queryLower.includes('work')) {
    category = 'experience';
  } else if (queryLower.includes('achievement') || queryLower.includes('competition')) {
    category = 'achievements';
  }
  
  // Accept if professional or has question pattern
  if (confidence >= 0.65 || professionalMatches > 0) {
    return {
      isValid: true,
      category,
      confidence
    };
  }
  
  // Reject with helpful message
  return {
    isValid: false,
    reason: "I can answer questions about my professional background, skills, projects, and career. What would you like to know?",
    confidence: 0.8
  };
}

/**
 * OPTIMIZED: Enhance query for better context retrieval
 */
export function enhanceQuery(query: string): string {
  const queryLower = query.toLowerCase();
  
  // Add context to common vague queries
  if (queryLower.includes('tell me about yourself') || queryLower === 'about you') {
    return `${query} - include technical skills, projects, education, achievements`;
  }
  
  if (queryLower.includes('what can you do') || queryLower.includes('capabilities')) {
    return `technical skills, programming languages, frameworks, projects, achievements`;
  }
  
  if (queryLower.includes('experience') && !queryLower.includes('work') && !queryLower.includes('project')) {
    return `${query} work experience and projects`;
  }
  
  return query;
}

/**
 * Check if query is about the AI itself
 */
export function isMetaQuery(query: string): boolean {
  const metaPatterns = [
    'what can you', 'what do you do', 'how do you work',
    'what are you', 'who made you', 'how were you built',
    'what\'s your purpose', 'how does this work'
  ];
  
  const queryLower = query.toLowerCase();
  return metaPatterns.some(pattern => queryLower.includes(pattern));
}
