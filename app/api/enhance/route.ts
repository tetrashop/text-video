// app/api/enhance/route.ts
import { NextResponse } from 'next/server';

// لیست مدل‌های رایگان و فعال (به ترتیب اولویت)
const FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'qwen/qwen3.8-27b:free',
  'google/gemini-3.5-flash:free',
  'inclusionai/ling-3.0-flash-vl:free'
];

export async function POST(request: Request) {
  try {
    const { story } = await request.json();
    if (!story || typeof story !== 'string' || !story.trim()) {
      return NextResponse.json({ error: 'لطفاً متن داستان را وارد کنید.' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = 'https://openrouter.ai/api/v1';

    if (!apiKey) {
      return NextResponse.json({ prompt: story, note: 'کلید OpenRouter تنظیم نشده، از متن خام استفاده می‌شود.' });
    }

    const systemPrompt = `You are an expert at writing cinematic video generation prompts. Convert the following story into a detailed, vivid, and concise English prompt suitable for an AI video generator. Focus on visual details, lighting, camera movement, and atmosphere. Return ONLY the prompt text, without any explanations or quotes.`;

    let lastError = '';

    // امتحان کردن مدل‌ها به ترتیب
    for (const modelName of FREE_MODELS) {
      try {
        console.log(`Attempting enhance with model: ${modelName}`);

        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://text-video-one.vercel.app',
            'X-Title': 'Story to Video',
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: story },
            ],
            temperature: 0.7,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          // اگر خطای 429 (محدودیت نرخ) یا 404 (مدل موجود نیست) بود، به مدل بعدی برو
          if (res.status === 429 || res.status === 404) {
            lastError = `Model ${modelName} failed with ${res.status}`;
            continue; // برو به مدل بعدی
          }
          // برای سایر خطاها (مثل 500)، یک خطای واقعی پرتاب کن
          throw new Error(`OpenRouter request failed: ${res.status} ${err}`);
        }

        const data = await res.json();
        const prompt = data.choices?.[0]?.message?.content?.trim();

        if (prompt) {
          return NextResponse.json({ prompt, model: modelName });
        }
        lastError = `Model ${modelName} returned empty prompt`;
      } catch (err: any) {
        lastError = err.message;
        // اگر خطای شبکه بود، باز هم به مدل بعدی برو
        continue;
      }
    }

    // اگر همه مدل‌ها شکست خوردند
    throw new Error(`همه مدل‌های رایگان در دسترس نیستند. آخرین خطا: ${lastError}`);
  } catch (error: any) {
    console.error('خطا در بهینه‌سازی داستان:', error);
    return NextResponse.json({ prompt: '', error: error.message }, { status: 500 });
  }
}
