import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const AJAX_URL = 'https://otakudesu.blog/wp-admin/admin-ajax.php';
const NONCE_ACTION = 'aa1208d27f29ca340c92c66d1926f13f';
const MIRROR_ACTION = '2a3505c93b0035d3f455df82bf976b84';
const NONCE_TTL = 10 * 60 * 1000;

const BLOCKED_HOSTS = [
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let cachedNonce = { value: '', at: 0 };

function proxyUrl(url, kind) {
  return `/api/media?kind=${kind}&url=${encodeURIComponent(url)}`;
}

function decodePackedString(value) {
  return value.replace(/\\(\\|')/g, '$1').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
}

function readQuoted(source, start) {
  const quote = source[start];
  let value = '';
  for (let i = start + 1; i < source.length; i += 1) {
    if (source[i] === '\\') {
      value += source[i + 1] || '';
      i += 1;
    } else if (source[i] === quote) {
      return { value: decodePackedString(value), next: i + 1 };
    } else {
      value += source[i];
    }
  }
  return null;
}

function findPackedArguments(source) {
  const marker = 'function(p,a,c,k,e,d)';
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;

  const openBrace = source.indexOf('{', markerIndex + marker.length);
  if (openBrace < 0) return null;

  let depth = 0;
  let quote = '';
  for (let i = openBrace; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (char === '\\') i += 1;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        let cursor = i + 1;
        while (/\s/.test(source[cursor] || '')) cursor += 1;
        if (source[cursor] !== '(') return null;
        cursor += 1;
        while (/\s/.test(source[cursor] || '')) cursor += 1;

        const payload = readQuoted(source, cursor);
        if (!payload) return null;
        cursor = payload.next;
        const baseMatch = source.slice(cursor).match(/^\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*/);
        if (!baseMatch) return null;
        cursor += baseMatch[0].length;
        const dictionary = readQuoted(source, cursor);
        if (!dictionary) return null;

        return {
          payload: payload.value,
          base: Number(baseMatch[1]),
          count: Number(baseMatch[2]),
          dictionary: dictionary.value.split('|'),
        };
      }
    }
  }
  return null;
}

function unpackVidhideScript(source) {
  let decoded = source;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const packed = findPackedArguments(decoded);
    if (!packed) break;
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
    const token = (number) => {
      if (number < packed.base) return number.toString(packed.base);
      return `${token(Math.floor(number / packed.base))}${alphabet[number % packed.base]}`;
    };
    let output = packed.payload;
    for (let index = packed.count - 1; index >= 0; index -= 1) {
      const replacement = packed.dictionary[index] || token(index);
      output = output.replace(new RegExp(`\\b${token(index)}\\b`, 'g'), replacement);
    }
    if (output === decoded) break;
    decoded = output;
  }
  return decoded;
}

function parseFiledonUrl(html) {
  const signatureIndex = html.indexOf('X-Amz-Signature');
  if (signatureIndex < 0) return '';
  const start = html.lastIndexOf('http', signatureIndex);
  if (start < 0) return '';

  let end = signatureIndex;
  while (end < html.length && html.slice(end, end + 6) !== '&quot;' && html[end] !== '"' && html[end] !== '\\') {
    end += 1;
  }

  const url = html
    .slice(start, end)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/');
  return url.startsWith('https://') ? url : '';
}

async function extractFiledonUrl(embedUrl) {
  const { data: html } = await axios.get(embedUrl, {
    headers: { 'User-Agent': UA, Referer: 'https://otakudesu.blog/' },
    timeout: 20000,
  });
  return parseFiledonUrl(html);
}

async function extractVidhideUrl(embedUrl) {
  const { data: html } = await axios.get(embedUrl, {
    headers: { 'User-Agent': UA, Referer: 'https://otakudesu.blog/' },
    timeout: 20000,
  });
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]);

  for (const script of scripts) {
    if (!script.includes('function(p,a,c,k,e,d)')) continue;
    const decoded = unpackVidhideScript(script);
    const matches = [...decoded.matchAll(/"(hls4|hls3|hls2)":"([^"]+)"/g)];
    const links = Object.fromEntries(matches.map((match) => [match[1], match[2]]));
    const url = links.hls2 || links.hls3 || links.hls4 || '';
    if (url) return url;
  }
  return '';
}

async function extractDesustreamUrl(embedUrl) {
  const { data: html } = await axios.get(embedUrl, {
    headers: { 'User-Agent': UA, Referer: 'https://otakudesu.blog/' },
    timeout: 20000,
  });
  const $ = cheerio.load(html);
  const playerFile = html.match(/\bfile\s*:\s*["']([^"']+)["']/i)?.[1] || '';
  const source = playerFile || $('video source').attr('src') || $('video').attr('src') || '';
  return source.startsWith('//') ? `https:${source}` : source;
}

async function postAjax(data) {
  const { data: res } = await axios.post(AJAX_URL, new URLSearchParams(data), {
    headers: {
      'User-Agent': UA,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': 'https://otakudesu.blog',
      'Referer': 'https://otakudesu.blog/',
    },
    timeout: 20000,
  });
  return res;
}

async function getNonce() {
  if (cachedNonce.value && Date.now() - cachedNonce.at < NONCE_TTL) {
    return cachedNonce.value;
  }
  const res = await postAjax({ action: NONCE_ACTION });
  const nonce = res?.data || '';
  if (!nonce) throw new Error('Gagal mendapatkan nonce dari sumber.');
  cachedNonce = { value: nonce, at: Date.now() };
  return nonce;
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

    let obj;
    try {
      obj = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.json({ error: 'Payload mirror tidak valid.' }, { status: 400 });
    }

    const nonce = await getNonce();
    const mirrorRes = await postAjax({ ...obj, nonce, action: MIRROR_ACTION });
    const html = Buffer.from(mirrorRes?.data || '', 'base64').toString('utf-8');
    const $ = cheerio.load(html);
    const src = $('iframe').attr('src') || '';

    if (!src) {
      return NextResponse.json({ error: 'Tidak ada source video untuk mirror ini.' }, { status: 404 });
    }

    const host = new URL(src.startsWith('//') ? `https:${src}` : src).hostname.toLowerCase();
    if (BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) {
      return NextResponse.json(
        { error: 'Server ini tidak didukung (beriklan atau tidak bisa di-embed).' },
        { status: 400 }
      );
    }

    const resolvedSrc = src.startsWith('//') ? `https:${src}` : src;
    if (host === 'filedon.co' || host.endsWith('.filedon.co')) {
      const url = await extractFiledonUrl(resolvedSrc);
      if (!url) return NextResponse.json({ error: 'URL video Filedon tidak ditemukan.' }, { status: 502 });
      return NextResponse.json({ url: proxyUrl(url, 'video'), player: 'direct' });
    }

    if (host === 'odvidhide.com' || host.endsWith('.odvidhide.com')) {
      const url = await extractVidhideUrl(resolvedSrc);
      if (!url) return NextResponse.json({ error: 'URL video VidHide tidak ditemukan.' }, { status: 502 });
      return NextResponse.json({ url: proxyUrl(url, 'manifest'), player: 'hls' });
    }

    if (host === 'desustream.net' || host.endsWith('.desustream.net')
      || host === 'desustream.com' || host.endsWith('.desustream.com')
      || host === 'desustream.me' || host.endsWith('.desustream.me')
      || host === 'desustream.info' || host.endsWith('.desustream.info')) {
      const url = await extractDesustreamUrl(resolvedSrc);
      if (!url) return NextResponse.json({ error: 'URL video DesuStream tidak ditemukan.' }, { status: 502 });
      return NextResponse.json({ url: proxyUrl(url, 'video'), player: 'direct' });
    }

    return NextResponse.json({ url: resolvedSrc, player: 'embed' });
  } catch (error) {
    console.error('Mirror resolve error:', error.message);
    return NextResponse.json({ error: error.message || 'Gagal memuat video.' }, { status: 500 });
  }
}
