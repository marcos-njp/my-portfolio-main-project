/**
 * ROBUST Session Memory System with Upstash Redis
 * Maintains conversation history for context-aware responses
 * Minimum 8-prompt memory with automatic cleanup
 * NOW WITH ADAPTIVE FEEDBACK LEARNING
 */

import { Redis } from '@upstash/redis';
import { FeedbackPreferences } from './feedback-detector';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mood?: string; // Track mood for each message
}

export interface SessionData {
  messages: SessionMessage[];
  sessionId: string;
  createdAt: number;
  lastActive: number;
  mood: string; // Current session mood
  feedbackPreferences?: FeedbackPreferences; // NEW: User preferences learned from feedback
}

const MAX_SESSION_MEMORY = 8; // Keep last 8 messages for AI context (optimal token efficiency)
const SESSION_TTL = 3600; // 1 hour TTL
const CHAT_HISTORY_TTL = 3600; // 1 hour TTL for complete chat history (auto clear)

/**
 * Generate session ID from browser fingerprint or create new one
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Save conversation history to Redis WITH feedback preferences
 * Maintains both session memory (for AI context) and complete chat history (for persistence)
 */
export async function saveConversationHistory(
  sessionId: string,
  messages: SessionMessage[],
  mood: string = 'professional',
  feedbackPreferences?: FeedbackPreferences
): Promise<void> {
  try {
    // SESSION MEMORY: Keep only the last MAX_SESSION_MEMORY messages for AI context
    const sessionMemory = messages.slice(-MAX_SESSION_MEMORY);
    
    const sessionData: SessionData = {
      messages: sessionMemory,
      sessionId,
      createdAt: Date.now(),
      lastActive: Date.now(),
      mood,
      feedbackPreferences,
    };

    // Save session memory (for AI context)
    await redis.setex(
      `chat_session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify(sessionData)
    );

    // CHAT HISTORY: Save complete conversation history separately
    await redis.setex(
      `chat_history:${sessionId}`,
      CHAT_HISTORY_TTL,
      JSON.stringify({
        messages: messages, // Complete history, no trimming
        sessionId,
        createdAt: Date.now(),
        lastActive: Date.now()
      })
    );

    console.log(`[Session Memory] Saved ${sessionMemory.length} messages for AI context`);
    console.log(`[Chat History] Saved ${messages.length} complete messages`);
    if (feedbackPreferences) {
      console.log(`[Adaptive Feedback] Saved preferences:`, feedbackPreferences);
    }
  } catch (error) {
    console.error('[Session Memory] Failed to save:', error);
    // Non-blocking: continue even if Redis fails
  }
}

/**
 * Load session memory from Redis (for AI context)
 */
export async function loadConversationHistory(
  sessionId: string
): Promise<SessionMessage[]> {
  try {
    const sessionData = await redis.get<SessionData>(`chat_session:${sessionId}`);
    
    if (!sessionData) {
      console.log(`[Session Memory] No session memory found for ${sessionId}`);
      return [];
    }

    console.log(`[Session Memory] Loaded ${sessionData.messages.length} messages for AI context`);
    
    return sessionData.messages;
  } catch (error) {
    console.error('[Session Memory] Failed to load:', error);
    return [];
  }
}

/**
 * Load complete chat history from Redis (for history display)
 */
export async function loadChatHistory(
  sessionId: string
): Promise<SessionMessage[]> {
  try {
    const historyData = await redis.get<{messages: SessionMessage[]}>(`chat_history:${sessionId}`);
    
    if (!historyData) {
      console.log(`[Chat History] No complete history found for ${sessionId}`);
      return [];
    }

    console.log(`[Chat History] Loaded ${historyData.messages.length} complete messages`);
    
    return historyData.messages;
  } catch (error) {
    console.error('[Chat History] Failed to load:', error);
    return [];
  }
}

/**
 * Load feedback preferences from Redis (NEW)
 */
export async function loadFeedbackPreferences(
  sessionId: string
): Promise<FeedbackPreferences | null> {
  try {
    const sessionData = await redis.get<SessionData>(`chat_session:${sessionId}`);
    
    if (!sessionData) return null;

    return sessionData.feedbackPreferences || null;
  } catch (error) {
    console.error('[Adaptive Feedback] Failed to load preferences:', error);
    return null;
  }
}

/**
 * Clear both session memory and chat history
 */
export async function clearSessionHistory(sessionId: string): Promise<void> {
  try {
    await redis.del(`chat_session:${sessionId}`);
    await redis.del(`chat_history:${sessionId}`);
    console.log(`[Session Memory] Cleared session memory and chat history for ${sessionId}`);
  } catch (error) {
    console.error('[Session Memory] Failed to clear:', error);
  }
}

/**
 * Get session mood
 */
export async function getSessionMood(sessionId: string): Promise<string> {
  try {
    const sessionData = await redis.get<SessionData>(`chat_session:${sessionId}`);
    
    if (!sessionData) return 'professional';

    return sessionData.mood || 'professional';
  } catch (error) {
    console.error('[Session Memory] Failed to get mood:', error);
    return 'professional';
  }
}

/**
 * Build context from session memory (not complete chat history)
 * Optimized: Reduced verbose follow-up rules from ~120 tokens to ~40 tokens
 */
export function buildConversationContext(messages: SessionMessage[]): string {
  if (messages.length === 0) return '';

  // Use session memory messages (already trimmed to MAX_SESSION_MEMORY)
  const recentMessages = messages.slice(-MAX_SESSION_MEMORY);
  
  let context = '\n\n=== HISTORY ===\n';
  
  recentMessages.forEach((msg) => {
    const speaker = msg.role === 'user' ? 'U' : 'A';
    context += `${speaker}: ${msg.content}\n`;
  });
  
  context += '=== END ===\n\nFOLLOW-UPS: "it"/"them"/"that" = what YOU just said. Check last Assistant message.\n';
  
  return context;
}
