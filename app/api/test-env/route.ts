import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...',
    geminiKey: process.env.GEMINI_API_KEY ? 'exists' : 'missing',
  });
}
