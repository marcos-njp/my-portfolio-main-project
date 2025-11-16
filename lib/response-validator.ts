/**
 * OPTIMIZED Response Validator - Mood Compliance Checker
 * Ensures AI responses match selected personality (GenZ vs Professional)
 * KEPT: Important for quality control and personality consistency
 */

import { type AIMood } from './ai-moods';

export interface ValidationResult {
  compliant: boolean;
  reason?: string;
  score: number; // 0-100
  details?: {
    hasSlang?: boolean;
    hasEmoji?: boolean;
    hasCasualStart?: boolean;
    slangCount?: number;
    emojiCount?: number;
    warnings?: string[];
  };
}

// OPTIMIZED: GenZ slang detection (from projectGenZ.md + brainrot culture)
const GENZ_SLANG = new Set([
  // Core vocabulary (high-frequency) - SAFE to use often
  'bet', 'no cap', 'cap', 'fr', 'ngl', 'tbh', 'lowkey', 'highkey', 'bruh', 'bro', 'dude',
  'valid', 'idk', 'say less', 'literally', 'wild', 'crazy',
  
  // Situational (medium-frequency) - use sparingly
  'it\'s giving', 'ate', 'delulu', 'npc', 'main character', 'rizz', 'touch grass',
  'iykyk', 'smh', 'mid', 'sus', 'vibe', 'fire', 'goated',
  
  // Brainrot tier (spicy) - for flavor, not spam
  'slaps', 'goes hard', 'built different', 'real', 'fax', 'on god', 'deadass',
  'W', 'L', 'ratio', 'based', 'cringe', 'cope', 'seethe', 'mald',
]);

// Casual starters
const CASUAL_STARTERS = ['yo', 'aight', 'so like', 'okay so', 'real talk', 'ngl', 'tbh', 'bruh', 'hey'];

// Emoji regex
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1F191}-\u{1F251}]/gu;

/**
 * OPTIMIZED: Validate GenZ mode compliance
 */
function validateGenZMode(response: string): ValidationResult {
  const lowerResponse = response.toLowerCase();
  const warnings: string[] = [];
  
  // Check for slang
  const slangMatches = Array.from(GENZ_SLANG).filter(term => lowerResponse.includes(term));
  const hasSlang = slangMatches.length > 0;
  const slangCount = slangMatches.length;
  
  // Check for repetitive "lowkey" usage (anti-pattern from projectGenZ.md)
  const lowkeyCount = (lowerResponse.match(/lowkey/g) || []).length;
  if (lowkeyCount > 2) {
    warnings.push(`Overusing "lowkey" (${lowkeyCount} times) - need variety`);
  }
  
  // Check for emojis
  const emojiMatches = response.match(EMOJI_REGEX);
  const hasEmoji = !!(emojiMatches && emojiMatches.length > 0);
  const emojiCount = emojiMatches ? emojiMatches.length : 0;
  
  // Check for casual starters
  const hasCasualStart = CASUAL_STARTERS.some(starter => 
    lowerResponse.startsWith(starter)
  );
  
  // Calculate score (0-100)
  let score = 0;
  
  // Slang contribution (50 points max - INCREASED weight)
  if (hasSlang) {
    score += Math.min(50, slangCount * 20); // More generous
  }
  
  // Emoji contribution (30 points max)
  if (hasEmoji) {
    score += Math.min(30, emojiCount * 15); // More generous
  }
  
  // Casual start (20 points)
  if (hasCasualStart) {
    score += 20;
  }
  
  // Lowercase usage bonus (check first 30 chars for better accuracy)
  const firstPart = response.substring(0, 30);
  const lowercaseRatio = firstPart.split('').filter(c => c === c.toLowerCase() && c !== ' ').length / firstPart.replace(/\s/g, '').length;
  if (lowercaseRatio > 0.6) {
    score += 15; // Increased bonus
  }
  
  // Contraction bonus (i'm, that's, it's, etc.)
  const hasContractions = /\w+'\w+/.test(response);
  if (hasContractions) {
    score += 10;
  }
  
  const details = {
    hasSlang,
    hasEmoji,
    hasCasualStart,
    slangCount,
    emojiCount,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
  
  // LOWERED threshold - accept at 35+ points (more lenient)
  if (score < 35) {
    return {
      compliant: false,
      reason: !hasSlang && !hasEmoji ? 
        'Missing GenZ vibe - needs slang, emojis, or casual style' : 
        'Response needs more casual energy',
      score,
      details,
    };
  }
  
  // Good compliance (even if just one slang word + lowercase)
  return { 
    compliant: true, 
    score,
    details,
    reason: warnings.length > 0 ? warnings.join('; ') : undefined
  };
}

/**
 * OPTIMIZED: Validate Professional mode compliance
 */
function validateProfessionalMode(response: string): ValidationResult {
  const lowerResponse = response.toLowerCase();
  const warnings: string[] = [];
  
  // Check for overly casual language
  const overlySlangTerms = ['yo', 'ngl', 'fr fr', 'bussin', 'ate', 'deadass', 'lowkey', 'highkey'];
  const casualMatches = overlySlangTerms.filter(term => lowerResponse.includes(term));
  
  if (casualMatches.length > 0) {
    warnings.push(`Too casual for professional mode: ${casualMatches.join(', ')}`);
    return {
      compliant: false,
      reason: 'Response too casual for professional mode',
      score: 30,
      details: { warnings },
    };
  }
  
  // Check for appropriate emojis (1-2 is okay, more than 3 is unprofessional)
  const emojiMatches = response.match(EMOJI_REGEX);
  const emojiCount = emojiMatches ? emojiMatches.length : 0;
  
  if (emojiCount > 3) {
    warnings.push(`Too many emojis (${emojiCount}) for professional mode`);
  }
  
  // Professional mode is compliant if not overly casual
  const score = warnings.length === 0 ? 100 : 70;
  
  return { 
    compliant: warnings.length === 0,
    score,
    details: { 
      emojiCount,
      warnings: warnings.length > 0 ? warnings : undefined 
    },
    reason: warnings.length > 0 ? warnings.join('; ') : undefined
  };
}

/**
 * MAIN: Validate response matches expected mood
 */
export function validateMoodCompliance(
  response: string, 
  mood: AIMood
): ValidationResult {
  if (mood === 'genz') {
    return validateGenZMode(response);
  } else {
    return validateProfessionalMode(response);
  }
}

/**
 * Log validation results for monitoring
 */
export function logValidationResult(
  validation: ValidationResult,
  mood: AIMood,
  response: string
): void {
  const scoreColor = validation.score >= 80 ? '✅' : validation.score >= 50 ? '⚠️' : '❌';
  
  console.log(`[Mood Validation] ${scoreColor} ${mood} mode - Score: ${validation.score}/100`);
  
  if (validation.details) {
    console.log('[Mood Validation] Details:', JSON.stringify(validation.details, null, 2));
  }
  
  if (!validation.compliant) {
    console.warn('[Mood Validation] Compliance issue:', validation.reason);
  }
}

/**
 * Get compliance score (0-100)
 */
export function getMoodComplianceScore(
  response: string,
  mood: AIMood
): number {
  const validation = validateMoodCompliance(response, mood);
  return validation.score;
}
