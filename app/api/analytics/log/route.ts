import { NextRequest, NextResponse } from 'next/server';
import { logChatInteraction } from '@/lib/analytics';

// Use Node.js runtime for Prisma (Edge runtime doesn't support Prisma)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    console.log('[Analytics API] 🔍 Starting request processing...');
    console.log('[Analytics API] 🔧 Environment check:', {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET ✅' : 'MISSING ❌',
      NODE_ENV: process.env.NODE_ENV,
    });
    
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
    console.error('[Analytics API] ❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
