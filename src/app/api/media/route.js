import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function isAllowedHost(hostname) {
  return (
    hostname.endsWith('.googlevideo.com')
    || hostname === 'archive.org'
    || hostname.endsWith('.archive.org')
    || hostname.endsWith('.cloudflarestorage.com')
    || hostname.endsWith('.acek-cdn.com')
    || hostname.endsWith('.dramiyos-cdn.com')
  );
}

function rewriteManifest(manifest, manifestUrl, requestUrl) {
  const proxy = (value, kind) => {
    const target = new URL(value, manifestUrl).toString();
    const url = new URL('/api/media', requestUrl);
    url.searchParams.set('kind', kind);
    url.searchParams.set('url', target);
    return url.toString();
  };

  return manifest
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (trimmed.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/g, (_, value) => `URI="${proxy(value, 'segment')}"`);
      }

      const kind = /\.m3u8(?:[?#]|$)/i.test(trimmed) ? 'manifest' : 'segment';
      return line.replace(trimmed, proxy(trimmed, kind));
    })
    .join('\n');
}

function responseHeaders(source, kind, contentLength) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'no-store');
  headers.set('Accept-Ranges', 'bytes');

  if (kind === 'manifest') {
    headers.set('Content-Type', 'application/vnd.apple.mpegurl');
  } else {
    headers.set('Content-Type', source.headers.get('content-type')?.startsWith('video/')
      ? source.headers.get('content-type')
      : 'video/mp4');
  }

  for (const name of ['content-length', 'content-range']) {
    const value = contentLength || source.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url') || '';
  const kind = searchParams.get('kind') || 'video';

  if (!target || !['video', 'manifest', 'segment'].includes(kind)) {
    return NextResponse.json({ error: 'Media URL tidak valid.' }, { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: 'Media URL tidak valid.' }, { status: 400 });
  }

  if (targetUrl.protocol !== 'https:' || !isAllowedHost(targetUrl.hostname.toLowerCase())) {
    return NextResponse.json({ error: 'Host media tidak didukung.' }, { status: 403 });
  }

  try {
    const headers = { 'User-Agent': USER_AGENT };
    const range = request.headers.get('range');
    if (range) headers.Range = range;

    const source = await fetch(targetUrl, { headers, redirect: 'follow', cache: 'no-store' });
    if (!source.ok && source.status !== 206) {
      return NextResponse.json({ error: `Media source mengembalikan HTTP ${source.status}.` }, { status: 502 });
    }

    if (kind === 'manifest') {
      const manifest = await source.text();
      return new NextResponse(rewriteManifest(manifest, targetUrl, new URL(request.url)), {
        status: 200,
        headers: responseHeaders(source, kind, null),
      });
    }

    return new NextResponse(source.body, {
      status: source.status,
      headers: responseHeaders(source, kind, null),
    });
  } catch (error) {
    console.error('Media proxy error:', error.message);
    return NextResponse.json({ error: 'Gagal mengambil media source.' }, { status: 502 });
  }
}
