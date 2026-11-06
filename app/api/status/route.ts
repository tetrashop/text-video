import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId missing' }, { status: 400 });
    }

    const apiKey = process.env.MAGIC_HOUR_API_KEY;

    // بررسی وضعیت در Magic Hour
    const statusRes = await fetch(`https://api.magichour.ai/v1/video-projects/${projectId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!statusRes.ok) throw new Error('Status check failed');
    const statusData = await statusRes.json();

    if (statusData.status === 'complete') {
      const videoUrl = statusData.download?.url;
      
      // دانلود ویدیو و ذخیره در Vercel Blob
      const videoRes = await fetch(videoUrl);
      const arrayBuffer = await videoRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const blob = await put(`story-video-${Date.now()}.mp4`, buffer, {
        access: 'private',
        contentType: 'video/mp4',
      });

      const origin = new URL(request.url).origin;
      const downloadUrl = `${origin}/api/download?pathname=${encodeURIComponent(blob.pathname)}`;

      return NextResponse.json({ status: 'complete', downloadUrl });
    }

    if (statusData.status === 'error') {
      return NextResponse.json({ status: 'error', message: 'ساخت ویدیو شکست خورد' });
    }

    // هنوز در حال ساخت است
    return NextResponse.json({ status: 'pending' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
