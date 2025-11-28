/**
 * Enhanced RAG (Retrieval-Augmented Generation) Utilities
 * Optimized with 0.75 relevance threshold for balanced accuracy and coverage
 */

import { Index } from '@upstash/vector';

export interface VectorResult {
  id: string;
  score: number;
  metadata?: {
    title?: string;
    content?: string;
    category?: string;
    [key: string]: unknown;
  };
}

export interface RAGContext {
  relevantChunks: string[];
  averageScore: number;
  topScore: number;
  chunksUsed: number;
  categories: string[];
}

/**
 * Enhanced vector search with optimized relevance threshold
 */
export async function searchVectorContext(
  vectorIndex: Index,
  query: string,
  options: {
    topK?: number;
    minScore?: number;
    includeMetadata?: boolean;
  } = {}
): Promise<RAGContext> {
  const {
    topK = 5,
    minScore = 0.75, // Balanced threshold for good accuracy and coverage
    includeMetadata = true,
  } = options;

  try {
    const results = await vectorIndex.query({
      data: query,
      topK,
      includeMetadata,
    }) as VectorResult[];

    if (!results || results.length === 0) {
      return {
        relevantChunks: [],
        averageScore: 0,
        topScore: 0,
        chunksUsed: 0,
        categories: [],
      };
    }

    // Filter by minimum score threshold
    const relevantResults = results.filter((result) => result.score >= minScore);

    if (relevantResults.length === 0) {
      // If no results meet threshold, use top 2 results if they're reasonably good (>0.65)
      const topResults = results.slice(0, 2).filter(r => r.score >= 0.65);
      if (topResults.length > 0) {
        const scores = topResults.map(r => r.score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        return {
          relevantChunks: topResults.map(r => formatChunk(r.metadata || {}, r.score)),
          averageScore: avgScore,
          topScore: Math.max(...scores),
          chunksUsed: topResults.length,
          categories: [...new Set(topResults.map(r => r.metadata?.category).filter(Boolean) as string[])],
        };
      }
      
      return {
        relevantChunks: [],
        averageScore: 0,
        topScore: 0,
        chunksUsed: 0,
        categories: [],
      };
    }

    // Calculate scores
    const scores = relevantResults.map(r => r.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const topScore = Math.max(...scores);

    // Extract categories
    const categories = [
      ...new Set(
        relevantResults
          .map(r => r.metadata?.category)
          .filter(Boolean) as string[]
      ),
    ];

    // Format chunks
    const relevantChunks = relevantResults.map(result => {
      const metadata = result.metadata || {};
      return formatChunk(metadata, result.score);
    });

    return {
      relevantChunks,
      averageScore,
      topScore,
      chunksUsed: relevantChunks.length,
      categories,
    };
  } catch (error) {
    console.error('Vector search error:', error);
    return {
      relevantChunks: [],
      averageScore: 0,
      topScore: 0,
      chunksUsed: 0,
      categories: [],
    };
  }
}

/**
 * Format a chunk with metadata for context injection
 */
function formatChunk(metadata: Record<string, unknown>, score?: number): string {
  const title = metadata.title || 'Information';
  const content = metadata.content || '';
  const category = metadata.category || '';
  
  let formatted = `[${title}]`;
  if (category) {
    formatted += ` (${category})`;
  }
  if (score !== undefined) {
    formatted += ` [Relevance: ${(score * 100).toFixed(1)}%]`;
  }
  formatted += `\n${content}`;
  
  return formatted;
}

/**
 * Build context string for AI prompt
 */
export function buildContextPrompt(ragContext: RAGContext): string {
  if (ragContext.chunksUsed === 0) {
    return '';
  }

  const contextHeader = `\n\n=== RELEVANT CONTEXT (${ragContext.chunksUsed} chunks, avg relevance: ${(ragContext.averageScore * 100).toFixed(1)}%) ===\n`;
  const contextBody = ragContext.relevantChunks.join('\n\n---\n\n');
  const contextFooter = `\n=== END CONTEXT ===\n\nUSE THIS CONTEXT to provide accurate, specific answers. Reference details from the context when relevant.`;

  return contextHeader + contextBody + contextFooter;
}

/**
 * Detect if query needs vector search or can use FAQ directly
 */
export function needsVectorSearch(query: string, faqMatchScore: number): boolean {
  // If FAQ match is very strong (>0.9), skip vector search
  if (faqMatchScore >= 0.9) {
    return false;
  }
  
  // For vague/complex queries, always use vector search
  const complexPatterns = [
    'tell me about',
    'explain',
    'describe in detail',
    'walk me through',
    'give me an overview',
  ];
  
  const queryLower = query.toLowerCase();
  if (complexPatterns.some(pattern => queryLower.includes(pattern))) {
    return true;
  }
  
  // For specific questions with moderate FAQ match, combine both
  return faqMatchScore < 0.9;
}

/**
 * Rerank results based on query intent
 */
export function rerankResults(
  results: VectorResult[],
  query: string
): VectorResult[] {
  const queryLower = query.toLowerCase();
  
  // Boost scores for results matching query intent
  const reranked = results.map(result => {
    let boostFactor = 1.0;
    const metadata = result.metadata || {};
    const category = metadata.category?.toLowerCase() || '';
    const title = metadata.title?.toLowerCase() || '';
    
    // Boost technical queries matching technical content
    if (queryLower.includes('technical') || queryLower.includes('programming') || queryLower.includes('code')) {
      if (category.includes('technical') || title.includes('skill') || title.includes('project')) {
        boostFactor = 1.15;
      }
    }
    
    // Boost project queries matching project content
    if (queryLower.includes('project') || queryLower.includes('built') || queryLower.includes('application')) {
      if (category.includes('project') || title.includes('project')) {
        boostFactor = 1.15;
      }
    }
    
    // Boost education queries matching education content
    if (queryLower.includes('education') || queryLower.includes('university') || queryLower.includes('degree')) {
      if (category.includes('education') || title.includes('education')) {
        boostFactor = 1.15;
      }
    }
    
    return {
      ...result,
      score: Math.min(result.score * boostFactor, 1.0), // Cap at 1.0
    };
  });
  
  // Sort by adjusted scores
  return reranked.sort((a, b) => b.score - a.score);
}

/**
 * Validate if retrieved context actually answers the specific question
 */
export function validateContextRelevance(query: string, retrievedContext: string, ragScore: number): {
  isRelevant: boolean;
  reason: string;
  confidence: number;
} {
  // If RAG score is too low, definitely not relevant
  if (ragScore < 0.6) {
    return {
      isRelevant: false,
      reason: 'Low semantic similarity score',
      confidence: 0.9
    };
  }
  
  // Check for timeline questions - need time indicators
  if (/how long|timeline|duration|time frame|hours|days|weeks|months/.test(query.toLowerCase())) {
    const hasTimeInfo = /\b(?:\d+\s*(?:hours?|days?|weeks?|months?|years?)|took|spent|duration|timeline)\b/i.test(retrievedContext);
    if (!hasTimeInfo) {
      return {
        isRelevant: false,
        reason: 'Context lacks timeline information for timeline question',
        confidence: 0.8
      };
    }
  }
  
  // Check for metrics questions - need numbers
  if (/how many|users|downloads|visits|metrics|stats|numbers/.test(query.toLowerCase())) {
    const hasMetrics = /\b(?:\d+\s*(?:users?|visits?|downloads?|%|percent|million|thousand)|traffic|revenue|conversion)\b/i.test(retrievedContext);
    if (!hasMetrics) {
      return {
        isRelevant: false,
        reason: 'Context lacks metrics for metrics question',
        confidence: 0.8
      };
    }
  }
  
  // Context seems relevant
  return {
    isRelevant: true,
    reason: 'Context appears to address the query',
    confidence: Math.min(ragScore, 0.85)
  };
}
