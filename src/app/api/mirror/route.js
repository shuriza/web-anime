import { NextResponse } from 'next/server';
import { resolveMirrorPayload } from '@/lib/mirror-resolver';

function vpsMediaUrl(base, url, kind) {
  return `${base}/media?kind=${kind}&url=${encodeURIComponent(url)}`;
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Request body tidak valid.' }, { status: 400 });
    }

    const payload = body?.payload || '';
    if (!payload) {
      return NextResponse.json({ error: 'Payload mirror kosong.' }, { status: 400 });
    }

    let result = null;
    const remoteApi = process.env.SCRAPER_API_URL?.replace(/\/$/, '');
    if (remoteApi) {
      try {
        const res = await fetch(`${remoteApi}/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.SCRAPER_API_KEY
              ? { 'X-API-Key': process.env.SCRAPER_API_KEY }
              : {}),
          },
          body: JSON.stringify({ payload }),
          cache: 'no-store',
          signal: AbortSignal.timeout(30000),
        });
        if (res.ok) {
          result = await res.json();
        } else {
          console.error('VPS resolve HTTP', res.status, await res.text());
        }
      } catch (error) {
        console.error('VPS resolve error:', error.message);
      }
    }

    if (!result?.url) {
      result = await resolveMirrorPayload(payload);
    }

    const { url, player } = result;
    if (!url) {
      return NextResponse.json({ error: 'Tidak ada source video untuk mirror ini.' }, { status: 404 });
    }

    if (player === 'direct') {
      const base = remoteApi || '';
      const resolvedUrl = base
        ? vpsMediaUrl(base, url, 'video')
        : `/api/media?kind=video&url=${encodeURIComponent(url)}`;
      return NextResponse.json({ url: resolvedUrl, player: 'direct' });
    }
    if (player === 'hls') {
      const base = remoteApi || '';
      const resolvedUrl = base
        ? vpsMediaUrl(base, url, 'manifest')
        : `/api/media?kind=manifest&url=${encodeURIComponent(url)}`;
      return NextResponse.json({ url: resolvedUrl, player: 'hls' });
    }
    return NextResponse.json({ url, player: 'embed' });
  } catch (error) {
    console.error('Mirror resolve error:', error.message);
    return NextResponse.json({ error: error.message || 'Gagal memuat video.' }, { status: 500 });
  }
}
