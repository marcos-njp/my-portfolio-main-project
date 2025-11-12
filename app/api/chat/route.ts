import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return new Response(
    JSON.stringify({ 
      message: 'Chat API endpoint - Implementation coming soon'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}