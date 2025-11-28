/**
 * SEMANTIC Query Validation - Professional Context Detection
 * Uses semantic patterns instead of exhaustive keyword lists
 * More intelligent and maintainable approach
 */

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  category?: string;
  confidence: number;
  errorType?: 'unrelated' | 'manipulation' | 'too_short' | 'tech_preferences' | 'entertainment' | 'personal' | 'inappropriate' | 'knowledge_gap';
  specificType?: string; // For detailed error categorization
}

// Core professional patterns - semantic approach
const PROFESSIONAL_PATTERNS = {
  // Technical patterns
  technical: /\b(?:code|coding|program|develop|software|web|app|api|database|tech|stack)\b/i,
  skills: /\b(?:skill|knowledge|experience|proficiency|expertise|learn|familiar)\b/i,
  projects: /\b(?:project|built|created|portfolio|deployed|application)\b/i,
  career: /\b(?:work|job|career|interview|hire|position|role|responsibility)\b/i,
  education: /\b(?:education|university|college|degree|study|course|graduate)\b/i,
  
  // Question patterns
  questions: /\b(?:what|how|why|when|where|who|which|can|do|are|is|tell|describe|explain)\b/i,
  
  // Professional inquiry patterns
  inquiry: /\b(?:about|yourself|background|introduction|achievements|strengths|goals)\b/i,
};

// Enhanced rejection patterns - comprehensive off-topic detection
const REJECTION_PATTERNS = {
  personal: /\b(?:girlfriend|boyfriend|dating|relationship|family|parents|address|phone|bank|password|salary|income|age|birthday)\b/i,
  inappropriate: /\b(?:hack|illegal|cheat|steal|pirate|crack|bypass|porn|sex|drugs|alcohol)\b/i,
  
  // Technology preferences (PC specs, hardware choices)
  tech_preferences: /\b(?:prefer|like|choose|better)\b.{0,20}\b(?:mac|windows|linux|android|ios)\b|\b(?:pc specs?|computer specs?|hardware|RAM|graphics? card|processor|CPU|GPU|intel|amd|nvidia|macbook|gaming rig)\b/i,
  
  // Entertainment and media
  entertainment: /\b(?:favorite|like|watch|listen).{0,20}\b(?:movie|music|show|game|anime|netflix|spotify)\b|\b(?:gaming|games|xbox|playstation|nintendo|youtube|tiktok|instagram|band|artist|actor|celebrity)\b/i,
  
  // General knowledge and random topics
  general_offtopic: /\b(?:weather|temperature|forecast|sports?|football|basketball|soccer|news|politics|politician|recipe|cooking|food|restaurant|travel|vacation|joke|funny|meme)\b/i,
  
  // Original off-topic patterns (kept for compatibility)
  offtopic: /\b(?:medical advice|legal advice|religion)\b/i,
  
  manipulation: /(?:ignore|forget|disregard).{0,20}(?:previous|instruction|rule|prompt|system)|(?:act as|pretend to be|jailbreak)/i,
};

/**
 * SEMANTIC: Validate if query is professionally relevant
 * Uses pattern matching instead of exhaustive keyword lists
 */
export function validateQuery(query: string): ValidationResult {
  const queryLower = query.toLowerCase().trim();
  
  // Empty query check
  if (!queryLower || queryLower.length < 2) {
    return {
      isValid: false,
      reason: "Query too short", // Generic reason for fallback
      errorType: 'too_short',
      confidence: 1.0
    };
  }
  
  // Whitelist for suggested questions - always allow these
  const suggestedQuestionPatterns = [
    /^what are your main projects\??$/i,
    /^tell me about your tech stack$/i,
    /^what competitions have you won\??$/i,
    /^what's your experience\??$/i,
    /^tell me about your education$/i,
    /^what technologies did you use\??$/i,
    /^any interesting challenges\??$/i,
    /^how did you approach it\??$/i,
    /^what was the outcome\??$/i,
    /^what did you study\??$/i,
    /^any notable achievements\??$/i
  ];
  
  if (suggestedQuestionPatterns.some(pattern => pattern.test(queryLower))) {
    return {
      isValid: true,
      category: 'suggested_question',
      confidence: 1.0
    };
  }
  
  // Greetings are always valid
  const greetingPattern = /^(?:hi|hello|hey|greetings|good (?:morning|afternoon|evening)|sup|yo)$/i;
  if (greetingPattern.test(queryLower)) {
    return {
      isValid: true,
      category: 'greeting',
      confidence: 1.0
    };
  }
  
  // Check for manipulation attempts FIRST (highest priority rejection)
  if (REJECTION_PATTERNS.manipulation.test(queryLower)) {
    return {
      isValid: false,
      reason: "Manipulation attempt detected", // Generic reason for fallback
      errorType: 'manipulation',
      confidence: 0.98
    };
  }
  
  // Check for inappropriate/irrelevant content with specific categorization
  for (const [type, pattern] of Object.entries(REJECTION_PATTERNS)) {
    if (type !== 'manipulation' && pattern.test(queryLower)) {
      // Map specific rejection types to error types
      let errorType: ValidationResult['errorType'] = 'unrelated';
      if (type === 'tech_preferences') errorType = 'tech_preferences';
      else if (type === 'entertainment') errorType = 'entertainment';
      else if (type === 'personal') errorType = 'personal';
      else if (type === 'inappropriate') errorType = 'inappropriate';
      
      return {
        isValid: false,
        reason: "Unrelated topic detected", // Generic reason for fallback
        errorType,
        specificType: type,
        confidence: 0.95
      };
    }
  }
  
  // Enhanced: Detect knowledge gaps (questions asking for unavailable info)
  const knowledgeGapPatterns = [
    // Timeline/duration questions
    { pattern: /how long (?:did|have you|took).{0,30}(?:develop|build|work|take|spend)/i, type: 'timeline' },
    { pattern: /(?:timeline|duration|time frame).{0,20}(?:project|development|build)/i, type: 'timeline' },
    
    // Metrics/numbers questions  
    { pattern: /how many (?:users|downloads|visits|views|clicks)/i, type: 'metrics' },
    { pattern: /(?:traffic|revenue|conversion|performance) (?:numbers|metrics|stats)/i, type: 'metrics' },
    
    // Personal/private info
    { pattern: /(?:salary|income|how much (?:do you make|earn)|home address|phone number)/i, type: 'personal_data' },
    
    // Very vague questions
    { pattern: /^(?:tell me about yourself|what can you do|anything|everything)$/i, type: 'vague_inquiry' }
  ];
  
  for (const { pattern, type } of knowledgeGapPatterns) {
    if (pattern.test(queryLower)) {
      return {
        isValid: false,
        category: 'knowledge_gap',
        errorType: 'knowledge_gap',
        specificType: type,
        confidence: 0.85
      };
    }
  }
  
  // Calculate professional relevance using semantic patterns
  let professionalScore = 0;
  const matchedCategories: string[] = [];
  
  for (const [category, pattern] of Object.entries(PROFESSIONAL_PATTERNS)) {
    if (pattern.test(queryLower)) {
      professionalScore++;
      matchedCategories.push(category);
    }
  }
  
  // Determine category from matched patterns
  let category = 'general';
  if (matchedCategories.includes('technical') || matchedCategories.includes('skills')) {
    category = 'technical_skills';
  } else if (matchedCategories.includes('projects')) {
    category = 'projects';
  } else if (matchedCategories.includes('education')) {
    category = 'education';
  } else if (matchedCategories.includes('career')) {
    category = 'experience';
  }
  
  // Calculate confidence based on professional pattern matches
  let confidence = 0.5;
  if (professionalScore >= 3) confidence = 0.95;
  else if (professionalScore >= 2) confidence = 0.85;
  else if (professionalScore >= 1) confidence = 0.75;
  else if (matchedCategories.includes('questions') || matchedCategories.includes('inquiry')) confidence = 0.65;
  
  // Accept if professional relevance detected
  if (confidence >= 0.65) {
    return {
      isValid: true,
      category,
      confidence
    };
  }
  
  // Reject with helpful message
  return {
    isValid: false,
    reason: "Not professionally relevant", // Generic reason for fallback
    errorType: 'unrelated',
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
