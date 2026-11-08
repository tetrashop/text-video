import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, duration } = await request.json();
    
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'پرامپت معتبر ارسال کنید.' }, { status: 400 });
    }

    const seconds = Number(duration);
    if (isNaN(seconds) || seconds < 3) {
      return NextResponse.json({ error: 'مدت زمان باید حداقل ۳ ثانیه باشد.' }, { status: 400 });
    }

    const apiKey = process.env.MAGIC_HOUR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'کلید MAGIC_HOUR_API_KEY تنظیم نشده است.' }, { status: 500 });
    }

    const submitRes = await fetch('https://api.magichour.ai/v1/text-to-video', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'ltx-2.5',
        end_seconds: seconds,
        style: { prompt: prompt }, // حالا از prompt استفاده می‌کند
        resolution: '480p',
        aspect_ratio: '16:9',
      }),
    });

    if (!submitRes.ok) {
      const errBody = await submitRes.text();
      throw new Error(`Magic Hour submit failed: ${submitRes.status} ${errBody}`);
    }

    const submitData = await submitRes.json();
    return NextResponse.json({ projectId: submitData.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
