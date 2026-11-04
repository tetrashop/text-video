import { get } from '@vercel/blob';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.searchParams.get('pathname');
    if (!pathname) {
      return NextResponse.json({ error: 'pathname ارائه نشده است.' }, { status: 400 });
    }

    const result = await get(pathname, { access: 'private' });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: 'فایل یافت نشد.' }, { status: 404 });
    }

    const filename = pathname.split('/').pop() || 'video.mp4';

    return new Response(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'video/mp4',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('خطا در دانلود:', error);
    return NextResponse.json({ error: 'دانلود ناموفق بود.', details: error.message }, { status: 500 });
  }
}
