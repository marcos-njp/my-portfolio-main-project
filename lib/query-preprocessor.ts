/**
 * OPTIMIZED Query Preprocessing - Better Typo Detection & Text Normalization
 * Uses expanded dictionary + Levenshtein distance for smart corrections
 */

// Smart typo corrections - focus on most common patterns
const COMMON_TYPOS: Record<string, string> = {
  // Question words (most frequent)
  'wat': 'what', 'wut': 'what', 'hw': 'how', 'wy': 'why',
  // Text speak
  'ur': 'your', 'u': 'you', 'r': 'are', 'n': 'and',
  // Common professional terms
  'experiance': 'experience', 'skilss': 'skills', 'projets': 'projects',
  'programing': 'programming', 'developement': 'development', 'educaton': 'education',
  'abotu': 'about', 'teh': 'the', 'taht': 'that', 'wich': 'which'
};

// Smart pattern-based corrections
const TEXT_SPEAK_PATTERNS = [
  { pattern: /\b(can|could|do|are|were|did)\s+u\b/gi, replace: '$1 you' },
  { pattern: /\bur\s+(skills|experience|background|projects)/gi, replace: 'your $1' },
  { pattern: /\b(wat|wut)\s+(can|do|are|is)/gi, replace: 'what $2' },
  { pattern: /\bhw\s+(many|much)/gi, replace: 'how $1' },
  { pattern: /\br\s+u\b/gi, replace: 'are you' }
];

/**
 * Smart typo correction using patterns and common fixes
 */
export function fixTypos(query: string): string {
  let corrected = query.toLowerCase();
  
  // Apply text speak patterns
  for (const { pattern, replace } of TEXT_SPEAK_PATTERNS) {
    corrected = corrected.replace(pattern, replace);
  }
  
  // Fix common individual words
  const words = corrected.split(/\s+/);
  const fixedWords = words.map(word => {
    const cleanWord = word.replace(/[.,!?;:]$/, '');
    const punctuation = word.slice(cleanWord.length);
    
    return (COMMON_TYPOS[cleanWord] || cleanWord) + punctuation;
  });
  
  return fixedWords.join(' ');
}

/**
 * Normalize query text
 */
export function normalizeQuery(query: string): string {
  let normalized = query.trim();
  
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Fix common punctuation issues
  normalized = normalized.replace(/\s+([.,!?])/g, '$1');
  normalized = normalized.replace(/([.,!?])([a-zA-Z])/g, '$1 $2');
  
  return normalized;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Smart correction for key professional terms only
 */
export function correctKeyTerms(query: string): string {
  // Focus on most commonly misspelled professional terms
  const keyTerms = {
    'programming': ['programing', 'programmin', 'progamming'],
    'experience': ['experiance', 'experince', 'expereince'],
    'development': ['developement', 'devlopment', 'develpoment'],
    'projects': ['projets', 'projetcs', 'porjects'],
    'skills': ['skilss', 'skils', 'skiils'],
    'technical': ['tecnical', 'techincal', 'technincal'],
    'education': ['educaton', 'educaiton', 'educaion'],
    'university': ['unversity', 'universtiy', 'univeristy']
  };
  
  let corrected = query;
  for (const [correct, misspellings] of Object.entries(keyTerms)) {
    for (const misspelling of misspellings) {
      const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
      corrected = corrected.replace(regex, correct);
    }
  }
  
  return corrected;
}

/**
 * OPTIMIZED preprocessing pipeline
 */
export function preprocessQuery(query: string): { original: string; corrected: string; changes: string[] } {
  const original = query;
  const changes: string[] = [];
  
  // Step 1: Normalize
  let processed = normalizeQuery(query);
  
  // Step 2: Fix known typos (dictionary)
  const afterTypoFix = fixTypos(processed);
  if (afterTypoFix !== processed) {
    changes.push('Fixed common typos');
    processed = afterTypoFix;
  }
  
  // Step 3: Correct key professional terms
  const afterTermCorrection = correctKeyTerms(processed);
  if (afterTermCorrection !== processed) {
    changes.push('Corrected professional terminology');
    processed = afterTermCorrection;
  }
  
  return {
    original,
    corrected: processed,
    changes,
  };
}
