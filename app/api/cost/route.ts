import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { duration } = await request.json();
    const seconds = Number(duration);

    if (isNaN(seconds) || seconds < 3) {
      return NextResponse.json({ error: 'حداقل مدت زمان ویدیو ۳ ثانیه است.' }, { status: 400 });
    }

    // تعرفه پایه Magic Hour: ۲۴ اعتبار در هر ثانیه برای مدل‌های ltx-2.5 و wan-2.2
    const creditsPerSecond = 24;
    const totalCredits = seconds * creditsPerSecond;

    return NextResponse.json({ credits: totalCredits, rate: creditsPerSecond });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
