/**
 * OPTIMIZED FAQ Pattern Matching - Context Hints for Common Questions
 * Provides RAG focus areas without hardcoding responses
 * KEPT: Helps guide RAG to relevant content chunks
 */

export interface FAQPattern {
  category: string;
  question: string;
  keywords: string[];
  contextHint: string; // What to focus on from RAG
  relevance_boost: number;
}

// OPTIMIZED: Reduced and focused FAQ patterns
export const FAQ_PATTERNS: FAQPattern[] = [
  // Introduction (most common)
  {
    category: "introduction",
    question: "Tell me about yourself",
    keywords: ["about yourself", "introduce yourself", "who are you", "background", "tell me about"],
    contextHint: "Focus on: personal profile (chunk_1), education (chunk_13), key projects (chunks 14-16, 22-23), competition achievements (chunks 8-9)",
    relevance_boost: 0.95
  },
  {
    category: "introduction",
    question: "Why should we hire you?",
    keywords: ["why hire", "why should we", "what makes you", "why you", "hire you"],
    contextHint: "Focus on: unique value (chunk_25), competition achievements (chunks 8-9), deployed projects (chunks 5-7), technical skills (chunks 10-11)",
    relevance_boost: 0.95
  },
  
  // Technical Skills (common)
  {
    category: "technical",
    question: "What programming languages?",
    keywords: ["programming languages", "languages", "what languages", "languages do you know"],
    contextHint: "Focus on: programming languages (chunk_10) with years and proficiency levels",
    relevance_boost: 0.95
  },
  {
    category: "technical",
    question: "Tech stack and tools",
    keywords: ["tech stack", "technologies", "frameworks", "tools", "what do you use"],
    contextHint: "Focus on: technical skills and tools (chunk_11) - databases, cloud, frontend, backend, AI/ML",
    relevance_boost: 0.95
  },
  
  // Projects (very common)
  {
    category: "projects",
    question: "Tell me about your projects",
    keywords: ["projects", "what have you built", "portfolio", "applications", "apps"],
    contextHint: "Focus on: AI-Powered Portfolio (chunk_14, chunk_7), Person Search (chunk_15, chunk_5), Modern Portfolio (chunk_16, chunk_6), AI Agent Setup (chunk_22), Movie App (chunk_23)",
    relevance_boost: 0.93
  },
  
  // Achievements
  {
    category: "achievements",
    question: "What are your achievements?",
    keywords: ["achievements", "accomplishments", "awards", "proud of", "success"],
    contextHint: "Focus on: key achievements (chunk_18), international competition (chunk_8), national competition (chunk_9)",
    relevance_boost: 0.95
  },
  
  // Career Goals
  {
    category: "career",
    question: "Career goals",
    keywords: ["career goals", "future plans", "where do you see yourself", "aspirations", "long term"],
    contextHint: "Focus on: career goals (chunk_17), technical interests (chunk_28), learning focus",
    relevance_boost: 0.9
  },
  
  // Salary & Compensation
  {
    category: "compensation",
    question: "Salary expectations",
    keywords: ["salary", "compensation", "pay", "rate", "expectations"],
    contextHint: "Focus on: salary and location preferences (chunk_3)",
    relevance_boost: 0.85
  },
  
  // Weaknesses (interview prep)
  {
    category: "interview",
    question: "What are your weaknesses?",
    keywords: ["weakness", "weaknesses", "areas to improve", "what you struggle"],
    contextHint: "Focus on: weakness mitigation strategies (chunks 19-20)",
    relevance_boost: 0.9
  },
];

/**
 * OPTIMIZED: Find relevant FAQ patterns for query
 * Returns context hints to guide RAG, not hardcoded responses
 */
export function findRelevantFAQPatterns(query: string, topK = 2): FAQPattern[] {
  const lowerQuery = query.toLowerCase();

  const scored = FAQ_PATTERNS.map((pattern) => {
    let score = 0;

    // Keyword matching (primary)
    const keywordMatches = pattern.keywords.filter((keyword) =>
      lowerQuery.includes(keyword.toLowerCase())
    ).length;
    
    score += keywordMatches * 0.4;

    // Word overlap (secondary)
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
    const questionWords = pattern.question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const overlap = queryWords.filter((word) => questionWords.includes(word)).length;
    
    score += overlap * 0.2;

    // Apply boost
    score *= pattern.relevance_boost;

    return { pattern, score };
  });

  // Return top matching patterns (minimum threshold: 0.25)
  return scored
    .filter(({ score }) => score > 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ pattern }) => pattern);
}

/**
 * Build context hints string for system prompt
 * Optimized: Reduced from ~40 tokens to ~15 tokens
 */
export function buildContextHints(patterns: FAQPattern[]): string {
  if (patterns.length === 0) return '';
  
  let hints = '\n\nCONTEXT FOCUS AREAS:\n';
  patterns.forEach((pattern, idx) => {
    hints += `${idx + 1}. ${pattern.contextHint} (Category: ${pattern.category})\n`;
  });
  
  return hints;
}
