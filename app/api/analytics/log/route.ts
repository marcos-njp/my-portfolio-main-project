import { NextRequest, NextResponse } from 'next/server';
import { logChatInteraction } from '@/lib/analytics';

// Use Node.js runtime for Prisma (Edge runtime doesn't support Prisma)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    console.log('[Analytics API] 📝 Received request:', {
      sessionId: data.sessionId,
      queryLength: data.userQuery?.length,
      responseLength: data.aiResponse?.length,
      mood: data.mood,
    });
    
    // Log to Neon Postgres (ONLY questions and AI responses, NOT comments)
    await logChatInteraction(data);
    
    console.log('[Analytics API] ✅ Successfully logged to database');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics API] ❌ Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
