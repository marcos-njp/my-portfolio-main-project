import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { Index } from '@upstash/vector';
import { searchVectorContext, buildContextPrompt, validateContextRelevance } from '@/lib/rag-utils';
import { preprocessQuery } from '@/lib/query-preprocessor';
import { validateQuery, enhanceQuery } from '@/lib/query-validator';
import { findRelevantFAQPatterns, buildContextHints } from '@/lib/interviewer-faqs';
import { validateMoodCompliance } from '@/lib/response-validator';
import { getResponseLengthInstruction } from '@/lib/response-manager';
import { getMoodConfig, getPersonaResponse, getSmartFallbackResponse, type AIMood } from '@/lib/ai-moods';


import { 
  saveConversationHistory, 
  loadConversationHistory,
  loadFeedbackPreferences,
  buildConversationContext,
  type SessionMessage 
} from '@/lib/session-memory';
import {
  detectFeedback,
  applyFeedback,
  buildFeedbackInstruction,
  isUnprofessionalRequest,
  getUnprofessionalRejection,
  type FeedbackPreferences,
} from '@/lib/feedback-detector';

// Edge Runtime configuration for Vercel
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Validate environment variables
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is not set in environment variables');
}
if (!process.env.UPSTASH_VECTOR_REST_URL) {
  console.error('❌ UPSTASH_VECTOR_REST_URL is not set in environment variables');
}
if (!process.env.UPSTASH_VECTOR_REST_TOKEN) {
  console.error('❌ UPSTASH_VECTOR_REST_TOKEN is not set in environment variables');
}

// Initialize Groq AI
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Initialize Upstash Vector
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL || '',
  token: process.env.UPSTASH_VECTOR_REST_TOKEN || '',
});

// System prompt - Clear and focused
const SYSTEM_PROMPT = `You are Niño Marcos's AI digital twin. Answer questions using the CONTEXT PROVIDED below.

CRITICAL RULES:
1. CHECK CONVERSATION HISTORY FIRST for follow-ups - if user says "it", "them", "that", "more details", look at what YOU just said
2. ALWAYS use specific details from context - names, numbers, technologies, achievements
3. For project questions: mention specific project names, tech stacks, and features from context
4. Answer AS Niño in first person ("I", "my", "me")
5. Keep responses 2-4 sentences unless the question needs more detail
6. Never give generic answers like "I can answer questions about..." - give the ACTUAL answer

KNOWLEDGE LIMITATIONS - Be honest about what you don't know:
- If asked about development timelines/hours: "I don't have the exact timeline documented, but I can tell you about the technologies and challenges"
- If asked about specific metrics/user numbers: "I don't have usage statistics to share, but I can discuss the technical implementation"
- If asked about private details: "I keep that information private, but I can share details about my professional work"
- ALWAYS offer alternative information you DO have when saying you don't know something

EXAMPLE OF FOLLOW-UPS:
You: "I built AI-Powered Portfolio, Person Search, and Modern Portfolio. Want details?"
User: "the tech stacks of it"
You: "AI-Powered Portfolio uses Next.js 15, Groq AI, Upstash Vector. Person Search uses Next.js, OAuth, Prisma, PostgreSQL. Modern Portfolio uses Next.js 15, Framer Motion, Tailwind CSS."

EXAMPLE OF SPECIFIC ANSWERS:
Bad: "I can answer questions about my projects"
Good: "I built an AI-Powered Portfolio with RAG using Next.js 15, Groq AI, and Upstash Vector. I also created a Person Search app with OAuth and PostgreSQL."

STYLE: Specific, confident, and helpful. Use real data from context.`;

export async function POST(req: Request) {
  let mood: AIMood = 'professional'; // Declare outside try block for error handler access
  
  try {
    // Validate environment variables at runtime
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY missing');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          message: 'AI service not configured. Please check environment variables.',
          details: 'GROQ_API_KEY is missing'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      console.error('❌ Upstash Vector credentials missing');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          message: 'Vector database not configured.',
          details: 'Upstash credentials missing'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, mood: requestMood = 'professional', sessionId } = await req.json() as { 
      messages: Message[];
      mood?: AIMood;
      sessionId?: string;
    };
    mood = requestMood; // Assign to outer variable
    
    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // ========== LOAD SESSION MEMORY & FEEDBACK PREFERENCES ==========
    // Load session memory (last 8 messages) for AI context - NOT complete chat history
    const sessionHistory = sessionId ? await loadConversationHistory(sessionId) : [];
    const conversationContext = buildConversationContext(sessionHistory);
    
    // Load user's learned feedback preferences (e.g., "be more detailed", "shorter responses")
    let feedbackPreferences: FeedbackPreferences = sessionId 
      ? await loadFeedbackPreferences(sessionId) || { feedback: [] }
      : { feedback: [] };

    // ========== STEP 0: Preprocess Query (Fix Typos) ==========
    const preprocessed = preprocessQuery(userQuery);
    const cleanQuery = preprocessed.corrected;
    
    // Log if typos were fixed
    if (preprocessed.changes.length > 0) {
      console.log(`[Typo Fix] Original: "${userQuery}" → Corrected: "${cleanQuery}" (${preprocessed.changes.join(', ')})`);
    }

    // ========== STEP 0.1: Check for Follow-Ups (Detect Early) ==========
    const isShortFollowUp = cleanQuery.length < 15 && sessionHistory.length > 0;
    const followUpPatterns = /^(yes|yeah|sure|ok|okay|tell me more|elaborate|continue|go on|please|why|how|what about)$/i;
    const isFollowUpResponse = followUpPatterns.test(cleanQuery.trim());

    // ========== STEP 0.5: Check for Unprofessional Requests FIRST ==========
    if (isUnprofessionalRequest(cleanQuery)) {
      console.log(`[Adaptive Feedback] Rejected unprofessional request: "${cleanQuery}"`);
      return new Response(
        JSON.stringify({ 
          error: 'unprofessional_request',
          message: getUnprofessionalRejection(cleanQuery, mood)
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ========== STEP 0.6: Detect User Feedback & Learn BEFORE Validation ==========
    const detectedFeedback = detectFeedback(cleanQuery);
    let isFeedbackQuery = false;
    
    if (detectedFeedback) {
      console.log(`[Adaptive Feedback] Detected ${detectedFeedback.type} feedback:`, detectedFeedback.instruction);
      isFeedbackQuery = true; // Mark as feedback to bypass validation
      
      if (detectedFeedback.isProfessional) {
        // Apply and save feedback preferences
        feedbackPreferences = applyFeedback(feedbackPreferences, detectedFeedback);
        console.log(`[Adaptive Feedback] Updated preferences:`, feedbackPreferences);
      } else {
        // Log unprofessional feedback but don't apply it
        console.log(`[Adaptive Feedback] Rejected unprofessional feedback:`, detectedFeedback.instruction);
      }
    }

    // ========== STEP 0.3: Enhanced Query Validation (Off-topic + Professional + Knowledge Gaps) ==========
    // Skip validation for feedback queries, follow-ups, and short responses
    const shouldSkipValidation = isFeedbackQuery || isShortFollowUp || isFollowUpResponse;
    
    if (!shouldSkipValidation) {
      const validation = validateQuery(cleanQuery);
      
      if (!validation.isValid) {
        console.log(`[Query Validation] Rejected: "${cleanQuery}" - Type: ${validation.errorType || 'unknown'}, Specific: ${validation.specificType || 'none'}`);
        
        // Use persona-aware error response based on error type
        const errorMessage = validation.errorType 
          ? getPersonaResponse(validation.errorType, mood)
          : validation.reason; // Fallback to generic reason
        
        return new Response(
          JSON.stringify({ 
            error: 'invalid_query',
            message: errorMessage
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      console.log(`[Query Validation] Valid: ${validation.isValid}, Confidence: ${validation.confidence.toFixed(2)}, Category: ${validation.category || 'none'}`);
    } else {
      console.log(`[Query Validation] Skipped validation for: ${isFeedbackQuery ? 'feedback' : 'follow-up'} query`);
    }
    
    // Enhance query with professional terms if detected
    const enhancedQuery = enhanceQuery(cleanQuery);
    if (enhancedQuery !== cleanQuery) {
      console.log(`[Query Enhancement] Enhanced: "${cleanQuery}" → "${enhancedQuery}"`);
    }

    // ========== STEP 1.5: FAQ Pattern Matching (Boost Interview Questions) ==========
    const faqMatches = findRelevantFAQPatterns(cleanQuery);
    let faqContextHints = '';
    
    if (faqMatches.length > 0) {
      faqContextHints = buildContextHints(faqMatches);
      console.log(`[FAQ Boost] Matched ${faqMatches.length} FAQ patterns - boosting RAG search`);
    }

    // ========== STEP 2: Vector Search with RAG ==========
    const ragContext = await searchVectorContext(vectorIndex, cleanQuery, {
      topK: 3, // Get top 3 most relevant chunks
      minScore: 0.6, // 60% threshold - balanced for quality context
      includeMetadata: true,
    });

    // ========== STEP 3: Enhanced Graceful Fallback - Knowledge Gap Detection ==========
    // CRITICAL: Require minimum relevance to prevent making up information
    const hasGoodContext = ragContext.chunksUsed > 0 && ragContext.topScore >= 0.6;
    
    // Enhanced: Check if retrieved context actually answers the specific question
    let contextRelevance = { isRelevant: true, reason: '', confidence: 1.0 };
    if (hasGoodContext) {
      const combinedContext = ragContext.relevantChunks.join(' ');
      contextRelevance = validateContextRelevance(cleanQuery, combinedContext, ragContext.topScore);
    }
    
    if ((!hasGoodContext || !contextRelevance.isRelevant) && !isShortFollowUp && !isFollowUpResponse) {
      console.log(`[Smart Fallback] Insufficient context for: "${cleanQuery}"`);
      console.log(`[Smart Fallback] RAG Score: ${ragContext.topScore.toFixed(2)}, Chunks: ${ragContext.chunksUsed}, Context Relevant: ${contextRelevance.isRelevant}`);
      
      // Use smart knowledge gap detection for better fallback messages
      const smartFallback = getSmartFallbackResponse(cleanQuery, mood, ragContext.topScore);
      
      return new Response(
        JSON.stringify({ 
          error: 'insufficient_context',
          message: smartFallback
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Build context prompt from vector search results
    // Optimized: Removed verbose warnings to reduce token usage (~50 tokens saved)
    let contextInfo = '';
    
    if (ragContext.chunksUsed > 0) {
      contextInfo += buildContextPrompt(ragContext);
      contextInfo += '\n\nOnly use info from CONTEXT. If not found, say "I don\'t have that info".';
    } else {
      // If no vector context found, rely on conversation history
      contextInfo += '\n\n⚠️ WARNING: No specific vector context found. You MUST NOT fabricate information. Only answer if you have relevant context from conversation history.';
    }

    // Log relevance metrics
    console.log(`[RAG Metrics] Query: "${cleanQuery}" | Chunks: ${ragContext.chunksUsed} | Avg Score: ${(ragContext.averageScore * 100).toFixed(1)}% | Top Score: ${(ragContext.topScore * 100).toFixed(1)}%`);

    // ========== STEP 4: Generate AI Response with Mood + Adaptive Feedback ==========
    const feedbackInstruction = buildFeedbackInstruction(feedbackPreferences);
    const moodConfig = getMoodConfig(mood);
    
    console.log(`[AI Generation] Mood: ${mood}, Temperature: ${moodConfig.temperature}, Mood Name: ${moodConfig.name}`);
    if (feedbackInstruction) {
      console.log(`[Adaptive Feedback] Applying user preferences to this response`);
    }
    
    // ========== STEP 4.5: Add Response Length Instruction (Soft Guidelines) ==========
    const lengthInstruction = getResponseLengthInstruction(); // Uses default constraints
    
    // Build final system prompt with mood-specific instructions
    const finalSystemPrompt = mood === 'genz'
      ? moodConfig.systemPromptAddition + '\n\n' +
        'REMINDER: You are in GenZ mode - use slang, emojis, and casual tone!\n\n' +
        SYSTEM_PROMPT + 
        conversationContext + 
        contextInfo +
        faqContextHints +
        feedbackInstruction +
        lengthInstruction
      : moodConfig.systemPromptAddition + '\n' + 
        SYSTEM_PROMPT + 
        conversationContext + 
        contextInfo +
        faqContextHints +
        feedbackInstruction +
        lengthInstruction;
    
    console.log(`[System Prompt Preview] First 500 chars: ${finalSystemPrompt.substring(0, 500)}...`);
    console.log(`[System Prompt] Total length: ${finalSystemPrompt.length} chars, Mood: ${mood}`);
    
    // Estimate token usage (rough: 1 token ≈ 4 chars for English)
    const estimatedSystemTokens = Math.ceil(finalSystemPrompt.length / 4);
    const estimatedUserTokens = Math.ceil(userQuery.length / 4);
    const estimatedTotalInputTokens = estimatedSystemTokens + estimatedUserTokens;
    console.log(`[Token Estimate] System: ~${estimatedSystemTokens} tokens, User: ~${estimatedUserTokens} tokens, Total Input: ~${estimatedTotalInputTokens} tokens`);
    
    const startTime = Date.now();
    
    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      system: finalSystemPrompt,
      messages,
      temperature: moodConfig.temperature,
      onFinish: async ({ text }) => {
        const responseTime = Date.now() - startTime;
        console.log(`[Response] Generated in ${responseTime}ms, ${text.length} chars`);
        
        // ========== STEP 5: Validate Response Mood Compliance ==========
        // Check if AI response matches requested mood (professional/genz)
        // Ensures consistent user experience across conversation
        const moodValidation = validateMoodCompliance(text, mood);
        
        if (!moodValidation.compliant) {
          console.warn(`[Response Validation] ⚠️ Mood compliance issue: ${moodValidation.reason || 'Unknown'}`);
          console.log(`[Response Validation] Compliance score: ${moodValidation.score}/100 (${mood} mode)`);
          if (moodValidation.details?.warnings) {
            console.warn(`[Response Validation] Warnings: ${moodValidation.details.warnings.join(', ')}`);
          }
        } else {
          console.log(`[Response Validation] ✅ ${mood} mode compliance: ${moodValidation.score}/100`);
        }
        
        // Save conversation history with feedback preferences
        if (sessionId) {
          const updatedHistory: SessionMessage[] = [
            ...sessionHistory,
            { role: 'user', content: userQuery, timestamp: Date.now(), mood },
            { role: 'assistant', content: text, timestamp: Date.now(), mood },
          ];
          
          await saveConversationHistory(sessionId, updatedHistory, mood, feedbackPreferences);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    // Log detailed error information for debugging
    // Helps identify API issues, rate limits, or configuration problems
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for Groq API rate limit errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isRateLimit = errorMessage.includes('429') || 
                        errorMessage.includes('rate limit') || 
                        errorMessage.includes('Too Many Requests');
    
    if (isRateLimit) {
      console.error('❌ Groq API rate limit exceeded');
      const rateLimitMessage = getPersonaResponse('rate_limit', mood || 'professional');
      
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: rateLimitMessage,
          timestamp: new Date().toISOString()
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Use persona-aware error message
    const genericErrorMessage = getPersonaResponse('error', mood || 'professional');
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response',
        message: `${genericErrorMessage} (${errorMessage})`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}