import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function analyzeBanglishComment(commentText: string) {
  const systemPrompt = `You are a Bangla/Banglish comment analyzer for a Facebook F-commerce business.
Determine if the comment shows buying intent.

Return ONLY a valid JSON object with these fields:
- "is_lead": boolean
- "intent": "price_inquiry" | "purchase_intent" | "size_inquiry" | "other"
- "product_mentioned": string or null
- "generated_reply": string (a friendly, casual Banglish reply that asks for details or confirms availability, e.g., "Bhai, red color available. Price 1200 taka. Apni ki niben?")

If the comment is not a buying signal, set is_lead to false and intent to "other". Do NOT wrap the JSON in code blocks.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: commentText },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  const raw = completion.choices[0]?.message?.content || '';
  
  try {
    // Parse the JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      is_lead: false,
      intent: 'other',
      product_mentioned: null,
      generated_reply: '',
    };
  }
}
