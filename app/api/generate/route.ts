import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const maxDuration = 300;

const MAGIC_HOUR_BASE = 'https://api.magichour.ai/v1';

export async function POST(request: Request) {
  try {
    const { story } = await request.json();
    if (!story || typeof story !== 'string' || !story.trim()) {
      return NextResponse.json({ error: 'لطفاً یک داستان معتبر ارسال کنید.' }, { status: 400 });
    }

    const apiKey = process.env.MAGIC_HOUR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'MAGIC_HOUR_API_KEY در متغیرهای محیطی تنظیم نشده است.' },
        { status: 500 }
      );
    }

    // ۱. ثبت درخواست در Magic Hour
    const submitRes = await fetch(`${MAGIC_HOUR_BASE}/text-to-video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'wan-2.2',
        end_seconds: 5, 
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
    const projectId = submitData.id;
    if (!projectId) {
      throw new Error(`project id دریافت نشد: ${JSON.stringify(submitData)}`);
    }

    // ۲. Polling تا آماده شدن ویدیو
    let videoUrl: string | null = null;
    const maxAttempts = 30;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 10000));

      const statusRes = await fetch(`${MAGIC_HOUR_BASE}/video-projects/${projectId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!statusRes.ok) {
        console.warn(`Status poll ${i + 1} failed: ${statusRes.status}`);
        continue;
      }

      const statusData = await statusRes.json();
      if (statusData.status === 'complete') {
        videoUrl = statusData.download?.url;
        if (videoUrl) break;
      } else if (statusData.status === 'error') {
        throw new Error(`تولید ویدیو شکست خورد: ${JSON.stringify(statusData)}`);
      }
    }

    if (!videoUrl) {
      throw new Error('زمان انتظار (۵ دقیقه) به پایان رسید و ویدیو آماده نشد.');
    }

    // ۳. دانلود و ذخیره در Vercel Blob
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error('دانلود ویدیوی تولیدشده ناموفق بود.');
    
    const arrayBuffer = await videoRes.arrayBuffer();
    
    // 💡 اصلاح تایپ‌اسکریپت: استفاده از Buffer به جای Uint8Array برای Vercel Blob
    const buffer = Buffer.from(arrayBuffer);

    const blob = await put(`story-video-${Date.now()}.mp4`, buffer, {
      access: 'private',
      contentType: 'video/mp4',
    });

    // ۴. بازگشت لینک دانلود از طریق مسیر اختصاصی خودمان
    const origin = new URL(request.url).origin;
    const downloadUrl = `${origin}/api/download?pathname=${encodeURIComponent(blob.pathname)}`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      provider: 'Magic Hour',
      model: 'wan-2.2',
    });
  } catch (error: any) {
    console.error('خطا در تولید ویدیو:', error);
    return NextResponse.json(
      { error: 'تولید ویدیو با خطا مواجه شد.', details: error.message },
      { status: 500 }
    );
  }
}
