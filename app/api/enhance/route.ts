import { NextResponse } from 'next/server';

// لیست پشتیبان در صورتی که دریافت لیست مدل‌ها از OpenRouter با خطا مواجه شود
const FALLBACK_MODELS = [
  'qwen/qwen-2.5-7b-instruct:free',
  'google/gemma-4-26b-a4b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free'
];

// تابعی برای دریافت لیست لحظه‌ای مدل‌های رایگان از OpenRouter
async function fetchFreeModels(): Promise<string[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) return FALLBACK_MODELS;
    
    const data = await res.json();
    
    // فیلتر کردن مدل‌هایی که پسوند :free دارند
    const freeModels = data.data
      .filter((m: any) => m.id.endsWith(':free'))
      .map((m: any) => m.id);
      
    return freeModels.length > 0 ? freeModels : FALLBACK_MODELS;
  } catch (error) {
    console.warn('خطا در دریافت لیست مدل‌ها، استفاده از لیست پشتیبان');
    return FALLBACK_MODELS;
  }
}

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

    // دریافت لیست مدل‌های رایگان فعال
    const availableModels = await fetchFreeModels();
    
    let lastError = '';

    // تلاش برای استفاده از ۳ مدل اول لیست (برای سرعت بیشتر و جلوگیری از تایم‌اوت)
    const modelsToTry = availableModels.slice(0, 3);

    for (const modelName of modelsToTry) {
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
          lastError = `Model ${modelName} failed with status ${res.status}`;
          continue; // اگر خطا داد، برو سراغ مدل بعدی
        }

        const data = await res.json();
        const prompt = data.choices?.[0]?.message?.content?.trim();

        if (prompt) {
          return NextResponse.json({ prompt, model: modelName });
        }
        lastError = `Model ${modelName} returned empty prompt`;
      } catch (err: any) {
        lastError = err.message;
        continue; // در صورت خطای شبکه، برو سراغ مدل بعدی
      }
    }

    // اگر همه مدل‌های امتحان شده شکست خوردند
    throw new Error(`متأسفانه هیچ‌کدام از مدل‌های رایگان پاسخ ندادند. آخرین خطا: ${lastError}`);
  } catch (error: any) {
    console.error('خطا در بهینه‌سازی داستان:', error);
    return NextResponse.json({ prompt: '', error: error.message }, { status: 500 });
  }
}
