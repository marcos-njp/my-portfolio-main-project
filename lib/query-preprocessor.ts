/**
 * OPTIMIZED Query Preprocessing - Better Typo Detection & Text Normalization
 * Uses expanded dictionary + Levenshtein distance for smart corrections
 */

// EXPANDED: Comprehensive typo mappings
const TYPO_CORRECTIONS: Record<string, string> = {
  // Question words
  'wat': 'what', 'wut': 'what', 'wht': 'what', 'waht': 'what',
  'hw': 'how', 'hwo': 'how',
  'wen': 'when', 'whn': 'when',
  'wer': 'where',
  'wy': 'why', 'wyh': 'why',
  'woh': 'who', 'wo': 'who',
  
  // Common verbs
  'cna': 'can', 'cann': 'can',
  'tel': 'tell', 'tlel': 'tell', 'tll': 'tell',
  'discribe': 'describe', 'descripe': 'describe', 'desribe': 'describe',
  'explane': 'explain', 'explian': 'explain', 'expain': 'explain',
  
  // Professional terms
  'experiance': 'experience', 'experince': 'experience', 'expereince': 'experience',
  'skilss': 'skills', 'skils': 'skills', 'skiils': 'skills',
  'projets': 'projects', 'projetcs': 'projects', 'porjects': 'projects',
  'programing': 'programming', 'programmin': 'programming', 'progamming': 'programming',
  'developement': 'development', 'devlopment': 'development', 'develpoment': 'development',
  'achivements': 'achievements', 'achievments': 'achievements', 'achivment': 'achievement',
  'educaton': 'education', 'educaiton': 'education', 'educaion': 'education',
  'tecnical': 'technical', 'techincal': 'technical', 'technincal': 'technical', 'techncal': 'technical',
  'compnay': 'company', 'comapny': 'company', 'companey': 'company',
  'bacground': 'background', 'backgorund': 'background', 'bakground': 'background',
  'interivew': 'interview', 'interveiw': 'interview', 'intervew': 'interview',
  'certifcate': 'certificate', 'certficate': 'certificate', 'certificat': 'certificate',
  'unversity': 'university', 'universtiy': 'university', 'univeristy': 'university',
  'gradute': 'graduate', 'graduete': 'graduate', 'graduat': 'graduate',
  'responsibilty': 'responsibility', 'responsibilites': 'responsibilities',
  
  // Tech terms
  'langauges': 'languages', 'languges': 'languages', 'langages': 'languages',
  'framworks': 'frameworks', 'framewroks': 'frameworks', 'framewoks': 'frameworks',
  'databse': 'database', 'databses': 'databases', 'databae': 'database',
  
  // Common words
  'abotu': 'about', 'abot': 'about', 'abuot': 'about', 'bout': 'about',
  'youself': 'yourself', 'urself': 'yourself', 'yurself': 'yourself',
  'yur': 'your', 'yor': 'your', 'yuor': 'your', 'ur': 'your',
  'thier': 'their', 'ther': 'their', 'thir': 'their',
  'teh': 'the', 'hte': 'the', 'te': 'the',
  'taht': 'that', 'tht': 'that', 'thta': 'that',
  'wich': 'which', 'whcih': 'which', 'wihch': 'which',
  'strenth': 'strength', 'stregth': 'strength', 'strengh': 'strength',
  'weekness': 'weakness', 'weaknes': 'weakness',
  'challange': 'challenge', 'chalenge': 'challenge', 'chalelnge': 'challenge',
};

// EXPANDED: Phrase corrections (higher priority)
const PHRASE_CORRECTIONS: Record<string, string> = {
  'tell me abot': 'tell me about',
  'tel me about': 'tell me about',
  'wat can you': 'what can you',
  'wat do you': 'what do you',
  'wat are you': 'what are you',
  'can u': 'can you',
  'cna you': 'can you',
  'could u': 'could you',
  'wats your': "what's your",
  'whats ur': "what's your",
  'wat is': 'what is',
  'wat are': 'what are',
  'wut is': 'what is',
  'wut are': 'what are',
  'hw many': 'how many',
  'hw much': 'how much',
  'discribe urself': 'describe yourself',
  'descibe yourself': 'describe yourself',
  'tel me ur': 'tell me your',
  'ur skills': 'your skills',
  'ur experience': 'your experience',
  'ur background': 'your background',
  'ur projects': 'your projects',
  'do u have': 'do you have',
  'have u': 'have you',
  'are u': 'are you',
  'were u': 'were you',
  'did u': 'did you',
  'r u': 'are you',
};

/**
 * Fix common typos using dictionary
 */
export function fixTypos(query: string): string {
  let corrected = query.toLowerCase();
  
  // Fix phrases first (higher priority)
  for (const [typo, correction] of Object.entries(PHRASE_CORRECTIONS)) {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, correction);
  }
  
  // Fix individual words
  const words = corrected.split(/\s+/);
  const fixedWords = words.map(word => {
    const cleanWord = word.replace(/[.,!?;:]$/, '');
    const punctuation = word.slice(cleanWord.length);
    
    if (TYPO_CORRECTIONS[cleanWord]) {
      return TYPO_CORRECTIONS[cleanWord] + punctuation;
    }
    return word;
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
 * SMART: Fuzzy correct professional terms using Levenshtein distance
 * Only corrects if word is close enough to known professional terms
 */
export function fuzzyCorrectProfessionalTerms(query: string): string {
  // Professional terms specific to Niño's domain
  const professionalTerms = [
    'programming', 'developer', 'software', 'engineer', 'frontend', 'backend',
    'fullstack', 'database', 'framework', 'experience', 'projects', 'skills',
    'education', 'university', 'graduate', 'achievements', 'technical',
    'javascript', 'typescript', 'python', 'react', 'nextjs', 'portfolio',
    'interview', 'company', 'salary', 'remote', 'internship', 'position',
    'oauth', 'prisma', 'postgresql', 'groq', 'upstash', 'vector', 'vercel',
    'tailwind', 'framer', 'motion', 'laravel', 'deployment', 'authentication',
  ];
  
  const words = query.toLowerCase().split(/\s+/);
  const correctedWords = words.map(word => {
    const cleanWord = word.replace(/[.,!?;:]$/, '');
    const punctuation = word.slice(cleanWord.length);
    
    // Skip short words (likely correct)
    if (cleanWord.length < 4) return word;
    
    // Skip if already in dictionary
    if (professionalTerms.includes(cleanWord)) return word;
    
    // Find closest professional term
    let bestMatch = cleanWord;
    let minDistance = Infinity;
    
    for (const term of professionalTerms) {
      const distance = levenshteinDistance(cleanWord, term);
      // Threshold: max 30% difference OR max 2 chars for short words
      const threshold = Math.min(3, Math.max(2, Math.floor(term.length * 0.3)));
      
      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        bestMatch = term;
      }
    }
    
    return bestMatch + punctuation;
  });
  
  return correctedWords.join(' ');
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
  
  // Step 3: Fuzzy correct professional terms (Levenshtein)
  const afterFuzzyFix = fuzzyCorrectProfessionalTerms(processed);
  if (afterFuzzyFix !== processed) {
    changes.push('Corrected professional terminology');
    processed = afterFuzzyFix;
  }
  
  return {
    original,
    corrected: processed,
    changes,
  };
}
