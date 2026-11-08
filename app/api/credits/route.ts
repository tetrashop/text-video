import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { story } = await request.json();
    if (!story || typeof story !== 'string' || !story.trim()) {
      return NextResponse.json({ error: 'لطفاً یک داستان معتبر ارسال کنید.' }, { status: 400 });
    }

    const apiKey = process.env.MAGIC_HOUR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'کلید API تنظیم نشده است.' }, { status: 500 });
    }

    // ثبت درخواست در Magic Hour
    const submitRes = await fetch('https://api.magichour.ai/v1/text-to-video', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'ltx-2.5',
        end_seconds: 3,
        style: { prompt: story },
        resolution: '480p',
        aspect_ratio: '16:9',
      }),
    });

    if (!submitRes.ok) {
      const errBody = await submitRes.text();
      throw new Error(`Magic Hour submit failed: ${submitRes.status} ${errBody}`);
    }

    const submitData = await submitRes.json();
    
    // فقط شناسه پروژه را برمی‌گردانیم تا مرورگر منتظر بماند
    return NextResponse.json({ projectId: submitData.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
