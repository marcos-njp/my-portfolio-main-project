/**
 * OPTIMIZED Response Length Management
 * Smart guidelines without hard truncation
 * KEPT: Provides length control through prompting (better approach)
 */

export interface LengthConstraints {
  maxTokens: number;
  softLimit: number;
  hardLimit: number;
}

export const DEFAULT_CONSTRAINTS: LengthConstraints = {
  maxTokens: 400,
  softLimit: 300,
  hardLimit: 500,
};

/**
 * Estimate token count (1 token ≈ 4 chars)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Count words
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * OPTIMIZED: Get response length instruction for system prompt
 * More natural, less restrictive
 */
export function getResponseLengthInstruction(constraints: LengthConstraints = DEFAULT_CONSTRAINTS): string {
  return `
RESPONSE LENGTH GUIDELINES:
- Keep responses FOCUSED and HELPFUL (2-4 sentences for simple questions)
- For complex questions: 4-6 sentences, use bullet points if listing items
- If topic needs more detail, provide a good summary first
- Aim for ~40-80 words for clarity without being wordy
- Use specific examples, numbers, and tech names to be informative while staying concise

EXAMPLES:
Q: "What programming languages do you know?"
A: "I'm proficient in JavaScript and TypeScript (Advanced, 2 years) and Python (Intermediate, 5 years). I mainly use JS/TS for web development with Next.js and React, while Python was my robotics competition language."

Q: "Tell me about your projects"
A: "I've built three main projects: 1) AI-powered portfolio with RAG system (Groq AI + Upstash Vector), 2) Person Search app (OAuth, Prisma, PostgreSQL), 3) Modern portfolio (Next.js 15, animations). All deployed on Vercel. Want details on any specific one?"

QUALITY OVER LENGTH: Be helpful and complete, not just short.`;
}

/**
 * Check if response needs length adjustment
 */
export function shouldManageLength(response: string, constraints: LengthConstraints = DEFAULT_CONSTRAINTS): {
  needsManagement: boolean;
  wordCount: number;
  tokenEstimate: number;
  suggestion?: string;
} {
  const wordCount = countWords(response);
  const tokenEstimate = estimateTokens(response);
  
  // Only flag if significantly over
  if (wordCount > 100) {
    return {
      needsManagement: true,
      wordCount,
      tokenEstimate,
      suggestion: 'Consider breaking into bullet points or suggesting user ask for specifics',
    };
  }
  
  if (tokenEstimate > constraints.hardLimit) {
    return {
      needsManagement: true,
      wordCount,
      tokenEstimate,
      suggestion: 'Response too long - aim for more concise summary',
    };
  }
  
  return {
    needsManagement: false,
    wordCount,
    tokenEstimate,
  };
}

/**
 * Add helpful follow-up suggestion based on topic
 */
export function addFollowUpPrompt(response: string, queryContext: string): string {
  const wordCount = countWords(response);
  
  // Only add for longer responses
  if (wordCount < 40) {
    return response;
  }
  
  const lowerResponse = response.toLowerCase();
  let followUp = '';
  
  if (lowerResponse.includes('project') || lowerResponse.includes('built')) {
    followUp = '\n\n💡 *Ask me for more details about specific projects or technical implementation choices.*';
  } else if (lowerResponse.includes('skill') || lowerResponse.includes('programming')) {
    followUp = '\n\n💡 *Feel free to ask about specific technologies, frameworks, or my proficiency levels.*';
  } else if (lowerResponse.includes('experience') || lowerResponse.includes('work')) {
    followUp = '\n\n💡 *I can elaborate on specific experiences, responsibilities, or achievements.*';
  } else if (lowerResponse.includes('competition') || lowerResponse.includes('achievement')) {
    followUp = '\n\n💡 *Ask about specific competitions or what I learned from them.*';
  }
  
  return response + followUp;
}
