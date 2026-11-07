// app/api/status/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) return NextResponse.json({ error: 'projectId missing' }, { status: 400 });

    const apiKey = process.env.MAGIC_HOUR_API_KEY;
    let statusData = null;
    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      try {
        const statusRes = await fetch(`https://api.magichour.ai/v1/video-projects/${projectId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (statusRes.ok) {
          statusData = await statusRes.json();
          break;
        }
      } catch (e) {
        console.warn(`Status check attempt ${attempt + 1} failed`);
      }
      attempt++;
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 2000));
    }

    if (!statusData) throw new Error('Failed to get status after retries');

    if (statusData.status === 'complete') {
      const videoRes = await fetch(statusData.download.url);
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

    return NextResponse.json({ status: 'pending' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
