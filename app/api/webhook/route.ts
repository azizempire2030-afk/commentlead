import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { analyzeBanglishComment } from '@/lib/groq';   // ✅ correct import

const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'my-super-secret-token';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log('Webhook received');

  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  if (value?.item === 'comment' && value?.message) {
    const commentText = value.message;
    const senderName = value.from?.name || 'Unknown';
    const pageId = entry.id;

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('facebook_page_id', pageId)
      .single();

    if (!merchant) {
      console.log('No merchant found for page:', pageId);
      return NextResponse.json({ success: false, reason: 'no merchant' });
    }

    const analysis = await analyzeBanglishComment(commentText);

    if (analysis.is_lead) {
      const { error } = await supabase.from('leads').insert({
        merchant_id: merchant.id,
        sender_name: senderName,
        comment_text: commentText,
        intent: analysis.intent,
        product_mentioned: analysis.product_mentioned,
        generated_reply: analysis.generated_reply,
      });

      if (error) console.error('Error saving lead:', error);
    }
  }

  return NextResponse.json({ success: true });
}
