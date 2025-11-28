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
 * Get response length instruction for system prompt
 */
export function getResponseLengthInstruction(constraints: LengthConstraints = DEFAULT_CONSTRAINTS): string {
  return `\nLENGTH: 2-4 sentences (simple Q), 4-6 sentences (complex Q). Use bullet points for lists. Be specific (names, tech, numbers). Quality > length.`;
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
export function addFollowUpPrompt(response: string, _queryContext: string): string {
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
