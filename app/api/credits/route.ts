import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.MAGIC_HOUR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    const res = await fetch('https://api.magichour.ai/v1/account', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      throw new Error(`Magic Hour account fetch failed: ${res.status}`);
    }

    const data = await res.json();
    
    // استخراج موجودی (بر اساس ساختار پاسخ API)
    const credits = data.credits ?? data.credit_balance ?? 0;
    
    return NextResponse.json({ credits });
  } catch (error: any) {
    console.error('خطا در دریافت اعتبار:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
