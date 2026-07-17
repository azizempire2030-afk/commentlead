import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function analyzeBanglishComment(commentText: string) {
  const prompt = `
You are a Bangla/Banglish comment analyzer for a Facebook F-commerce business.
Determine if the comment shows buying intent.

Return ONLY a valid JSON with:
{
  "is_lead": boolean,
  "intent": "price_inquiry" | "purchase_intent" | "size_inquiry" | "other",
  "product_mentioned": string or null,
  "generated_reply": string (friendly reply in Banglish asking for details or giving info)
}

Comment: "${commentText}"
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { is_lead: false, intent: 'other', product_mentioned: null, generated_reply: '' };
  }
}

