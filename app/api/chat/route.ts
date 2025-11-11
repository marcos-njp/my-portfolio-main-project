import { initializeVectorDatabase, generateRAGResponse } from '@/lib/digital-twin-rag';

export async function POST(req: Request) {
  try {
    const { messages, model = 'llama-3.1-8b-instant' } = await req.json();

    // Initialize vector database if needed (first time only)
    await initializeVectorDatabase();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const question = lastMessage.content;

    // Generate RAG response
    const result = await generateRAGResponse(question, model);

    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: result.response,
        metadata: result.context
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
