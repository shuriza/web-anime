import http from 'node:http';
import {
  getOngoingAnime,
  getCompletedAnime,
  getAnimeDetail,
  getEpisodeStreaming,
  searchAnime,
  getSchedule,
  getGenreList,
  getRandomAnimeSlug,
  getAnimeByGenre,
} from '../src/lib/scraper.js';
import { resolveMirrorPayload } from '../src/lib/mirror-resolver.js';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const API_KEY = process.env.SCRAPER_API_KEY || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://web-anime-taupe.vercel.app';
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Accept, Content-Type, X-API-Key',
  });
  response.end(JSON.stringify(body));
}

async function cached(key, loader) {
  const current = cache.get(key);
  if (current && current.expiresAt > Date.now()) return current.value;

  const value = await loader();
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL });
  return value;
}

function getRoute(url) {
  const path = url.pathname.split('/').filter(Boolean);
  return { resource: path[0] || '', slug: path.slice(1).join('/') };
}

async function route(requestUrl) {
  const { resource, slug } = getRoute(requestUrl);
  const page = Number(requestUrl.searchParams.get('page') || 1);

  if (resource === 'ongoing') return cached(`ongoing:${page}`, () => getOngoingAnime(page));
  if (resource === 'completed') return cached(`completed:${page}`, () => getCompletedAnime(page));
  if (resource === 'anime' && slug) return cached(`anime:${slug}`, () => getAnimeDetail(slug));
  if (resource === 'episode' && slug) return cached(`episode:${slug}`, () => getEpisodeStreaming(slug));
  if (resource === 'search') return cached(`search:${requestUrl.search}`, () => searchAnime(requestUrl.searchParams.get('q') || ''));
  if (resource === 'schedule') return cached('schedule', getSchedule);
  if (resource === 'genres') return cached('genres', getGenreList);
  if (resource === 'random') return { slug: await getRandomAnimeSlug() };
  if (resource === 'genre' && slug) return cached(`genre:${slug}:${page}`, () => getAnimeByGenre(slug, page));

  return undefined;
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': CORS_ORIGIN,
      'Access-Control-Allow-Headers': 'Accept, Content-Type, X-API-Key',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    response.end();
    return;
  }

  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/health') {
    sendJson(response, 200, { ok: true, service: 'shurizanime-scraper' });
    return;
  }

  if (!API_KEY || request.headers['x-api-key'] !== API_KEY) {
    sendJson(response, 401, { error: 'Unauthorized' });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/resolve') {
    let raw = '';
    for await (const chunk of request) raw += chunk;
    let payload = '';
    try {
      payload = JSON.parse(raw)?.payload || '';
    } catch {
      payload = '';
    }
    if (!payload) {
      sendJson(response, 400, { error: 'Payload mirror kosong.' });
      return;
    }
    try {
      const result = await resolveMirrorPayload(payload);
      sendJson(response, 200, result);
    } catch (error) {
      console.error('Resolve error:', error.message);
      sendJson(response, 502, { error: error.message || 'Gagal memuat video.' });
    }
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const result = await route(requestUrl);
    if (result === undefined) {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }
    sendJson(response, 200, result);
  } catch (error) {
    console.error('Scraper API error:', error.message);
    sendJson(response, 502, { error: 'Upstream scraper failed' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Scraper API listening on ${HOST}:${PORT}`);
});
