import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { story } = await request.json();
    if (!story || typeof story !== 'string' || !story.trim()) {
      return NextResponse.json({ error: 'لطفاً متن داستان را وارد کنید.' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY; 
    const baseUrl = 'https://openrouter.ai/api/v1';
    // مدل رایگان و فعال جایگزین شد
    const modelName = 'google/gemma-4-31b-it:free'; 

    if (!apiKey) {
      return NextResponse.json({ prompt: story, note: 'کلید OpenRouter تنظیم نشده، از متن خام استفاده می‌شود.' });
    }

    const systemPrompt = `You are an expert at writing cinematic video generation prompts. Convert the following story into a detailed, vivid, and concise English prompt suitable for an AI video generator. Focus on visual details, lighting, camera movement, and atmosphere. Return ONLY the prompt text, without any explanations or quotes.`;

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
      throw new Error(`OpenRouter request failed: ${res.status} ${err}`);
    }

    const data = await res.json();
    const prompt = data.choices?.[0]?.message?.content?.trim();

    if (!prompt) throw new Error('پاسخی از مدل زبانی دریافت نشد.');

    return NextResponse.json({ prompt });
  } catch (error: any) {
    console.error('خطا در بهینه‌سازی داستان:', error);
    return NextResponse.json({ prompt: '', error: error.message }, { status: 500 });
  }
}
