import axios from 'axios';
import * as cheerio from 'cheerio';
import { fetchRemote } from './vps-client.js';

const OTAKUDESU_URL = 'https://otakudesu.blog.';
const SCRAPER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'identity',
};

function isValidSourceHtml(html) {
  return typeof html === 'string'
    && html.length > 1000
    && /<html|<!doctype/i.test(html)
    && !/attention required|cloudflare|captcha|just a moment/i.test(html);
}

function getFallbackEpisode(slug) {
  const fallbackMirrors = {
    'sakh-episode-1-sub-indo': [
      ['ondesuhd', 'https://desustream.net/dstream/ondesu/new/hd/index.php?id=cnkvR3dxVmJjNFZNNGhyb0FtNzQwZz09'],
      ['odstream', 'https://desustream.net/dstream/arcg/?id=dFpnRmxLUStDM1huSjRHVzh0SmJKQUZ4TVg5dndHNVZSOXNxOWJGRERDUmhaRFhoMllYY1pISktuYTJSNURQQg=='],
      ['filedon', 'https://filedon.co/embed/JfTQ5I3gIM'],
      ['vidhide', 'https://odvidhide.com/embed/maoa5hb0nete'],
      ['mega', 'https://mega.nz/embed/NqwikKxY#ib2Kz87rn8hP7hJ-mzuUY0bLJm3t7uVIw1vX9xtgqfs'],
    ],
    'sakh-episode-2-sub-indo': [
      ['ondesuhd', 'https://desustream.net/dstream/ondesu/new/hd/index.php?id=Q3RGTlcxUXZnbTczdWVUTmdzWjdnZz09'],
      ['odstream', 'https://desustream.net/dstream/arcg/?id=WUJ3VXVUR1JQNVFSNkZCOUMxRy9DaWN2N2JTRGhoMXZTWEd2M2RPMUhkK2gwVkJOb0VhZ3lHTTFLdEZJQ0dyVQ=='],
      ['filedon', 'https://filedon.co/embed/vNKqV2evaF'],
      ['vidhide', 'https://odvidhide.com/embed/j05lnojp5037'],
      ['mega', 'https://mega.nz/embed/Zz01ySyY#7Czf8IUFV1u6YLcs04T9p8CFjN_GWKbczQRmcrVcbG8'],
    ],
    'sakh-episode-3-sub-indo': [
      ['ondesu2hd', 'https://desustream.net/dstream/ondesu2/new/hd/index.php?id=bktEMmMyRGI0Nkl5OENWc2tpN0k4M3BuVm1vdHo2bGFYTTVGT0RjUGNUdz0='],
      ['odstream', 'https://desustream.net/dstream/arcg/?id=b1gweDdSSHBUbzdXU1lkU2lXUVR6b2FjdVczZDlWQ05EWWNJNHppRytHdGhIWVMwcVVxSDdxTktjZERKQVc1QlF1S2F1bUVHVkFVakhQZTRPaHk3V1E9PQ=='],
      ['filedon', 'https://filedon.co/embed/XW6LqK9sWp'],
      ['vidhide', 'https://odvidhide.com/embed/pjty4tfwitto'],
      ['mega', 'https://mega.nz/embed/RNdnFRxB#0l14SVwcpfVr38vMwy0qwhUXzPWOK21P_3zLKsH7vNo'],
    ],
    'sakh-episode-4-sub-indo': [
      ['ondesu2hd', 'https://desustream.net/dstream/ondesu2/new/hd/index.php?id=dk9VUFppTTYxcDZBcmFqQW5Od2xBZkhXQUFqdUFCUGpCYWFKTS9DVGtNYz0='],
      ['odstream', 'https://desustream.net/dstream/arcg/?id=T1p4N1kyNzZ6NW9lNS9aOTUrVEhkVS9BNGZKYnhtSWRGQm9MNzVIWDM0NitGN1UybUhKVThybVR1MmErcDJJbDRXRWhPNlp3MzdXdUNHOENNV3J6Wmc9PQ=='],
      ['filedon', 'https://filedon.co/embed/DXoVnCyBld'],
      ['vidhide', 'https://odvidhide.com/embed/sjj0r88xcrvu'],
      ['mega', 'https://mega.nz/embed/VQ0EHSAK#eeNy8GqjFjsuHXUZ3Vrkg-on-QE3sVfW9wWUOaNkIQk'],
    ],
    'sakh-episode-5-sub-indo': [
      ['odstream', 'https://desustream.net/dstream/arcg/?id=bG1mY2owK2dsOG9mL2srN2RPdm13V1g2RG1FbjczZjNpWGNqT0MvTmdYbGJ6Q21KK0VjczIySDFxQXpJWGRQbFc4czlOa2FDREpvSW5xV2Y2VTNsNWc9PQ=='],
      ['ondesuhd', 'https://desustream.net/dstream/ondesu/new/hd/index.php?id=L1hSSmcxZkgzbG5HWHZQcFpWNndqQT09'],
      ['filedon', 'https://filedon.co/embed/2aSeevUA4E'],
      ['vidhide', 'https://odvidhide.com/embed/7rskzeo2p9ss'],
      ['mega', 'https://mega.nz/embed/neQ2nRyC#wzBzZFyaGXSKAhpvtpHPO7hURCMXETRo3bY01MRcAEI'],
    ],
    'sakh-episode-6-sub-indo': [
      ['ondesu2hd', 'https://desustream.net/dstream/ondesu2/new/hd/index.php?id=SnVJaXZPdkttT3IrM0tzeVBGSFQySUZuNFQ3Q01aUGpMbzZwL3g3d1ZMMD0='],
      ['odstream', 'https://desustream.net/dstream/arcg/?id=OVlkSm5uQ0xaOHgzKzVYOUtUSWkzT2RQQ1NycFJvdTVQR3dlK0UwaWd4TEF0ZklZNlJMUW52QjJsVkh2aS9PekREUi9lUGlrd3Q0SUJtb0xoajVmUVE9PQ=='],
      ['filedon', 'https://filedon.co/embed/jRH3FEelp9'],
      ['vidhide', 'https://odvidhide.com/embed/q0ze13gx9bys'],
      ['mega', 'https://mega.nz/embed/ZiFlEI5R#m64VON04FFxsDil7AAJfpqvjT4RqWOmesNQf7JkqAYQ'],
    ],
  };

  const mirrors = fallbackMirrors[slug];
  if (!mirrors) return null;

  const episodeNumber = slug.match(/episode-(\d+)/)?.[1] || '';
  return {
    title: `Sora wa Akai Kawa no Hotori Episode ${episodeNumber} Subtitle Indonesia`,
    slug,
    animeSlug: 'sora-akai-kawa-hotori-sub-indo',
    prevSlug: episodeNumber === '1' ? '' : `sakh-episode-${Number(episodeNumber) - 1}-sub-indo`,
    nextSlug: episodeNumber === '5' ? 'sakh-episode-6-sub-indo' : `sakh-episode-${Number(episodeNumber) + 1}-sub-indo`,
    mirrors: mirrors.map(([server, url]) => ({ quality: '720p', server, url, player: 'embed' })),
    downloads: [],
  };
}

async function fetchHTML(url) {
  const fetchAttempt = (targetUrl = url) => fetch(targetUrl, {
    headers: SCRAPER_HEADERS,
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  }).then((html) => {
    if (!isValidSourceHtml(html)) throw new Error('HTML sumber tidak valid.');
    return html;
  });

  try {
    const html = await Promise.any([
      axios.get(url, { headers: SCRAPER_HEADERS, timeout: 8000 }).then(({ data }) => {
        if (!isValidSourceHtml(data)) throw new Error('HTML sumber tidak valid.');
        return data;
      }),
      fetchAttempt(),
    ]);
    return cheerio.load(html);
  } catch (error) {
    if (url.startsWith('https://')) {
      try {
        const httpUrl = `http://${url.slice('https://'.length)}`;
        return cheerio.load(await fetchAttempt(httpUrl));
      } catch (fallbackError) {
        console.error(`Error fetching ${url}:`, fallbackError.message);
        return null;
      }
    }
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

// Get ongoing anime list
export async function getOngoingAnime(page = 1) {
  const remote = await fetchRemote(`/ongoing?page=${page}`);
  if (remote) return remote;

  const url = `${OTAKUDESU_URL}/ongoing-anime/page/${page}/`;
  const $ = await fetchHTML(url);
  if (!$) return { anime: [], hasNext: false };

  const anime = [];

  $('.venz ul li').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.thumbz h2.jdlflm').text().trim();
    const image = $el.find('.thumbz img').attr('src') || '';
    const link = $el.find('.thumb a').attr('href') || '';
    const episode = $el.find('.epz').text().trim();
    const day = $el.find('.epztipe').text().trim();
    const date = $el.find('.newnime').text().trim();
    const slug = link.split('/').filter(Boolean).pop() || '';

    if (title) {
      anime.push({ title, image, slug, episode, day, date, link });
    }
  });

  const hasNext = $('.pagenavix .next').length > 0;
  return { anime, hasNext };
}

// Get completed anime
export async function getCompletedAnime(page = 1) {
  const remote = await fetchRemote(`/completed?page=${page}`);
  if (remote) return remote;

  const url = `${OTAKUDESU_URL}/complete-anime/page/${page}/`;
  const $ = await fetchHTML(url);
  if (!$) return { anime: [], hasNext: false };

  const anime = [];

  $('.venz ul li').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.thumbz h2.jdlflm').text().trim();
    const image = $el.find('.thumbz img').attr('src') || '';
    const link = $el.find('.thumb a').attr('href') || '';
    const episode = $el.find('.epz').text().trim();
    const score = $el.find('.epztipe').text().trim();
    const date = $el.find('.newnime').text().trim();
    const slug = link.split('/').filter(Boolean).pop() || '';

    if (title) {
      anime.push({ title, image, slug, episode, score, date, link });
    }
  });

  const hasNext = $('.pagenavix .next').length > 0;
  return { anime, hasNext };
}

// Get anime detail
export async function getAnimeDetail(slug) {
  const remote = await fetchRemote(`/anime/${encodeURIComponent(slug)}`);
  if (remote) return remote;

  const url = `${OTAKUDESU_URL}/anime/${slug}/`;
  const $ = await fetchHTML(url);
  if (!$) return null;

  const title = $('.infozingle span:contains("Judul")').parent().text().replace('Judul: ', '').trim()
    || $('.jdlrx h1').text().trim();
  const japaneseTitle = $('.infozingle span:contains("Japanese")').parent().text().replace('Japanese: ', '').trim();
  const score = $('.infozingle span:contains("Skor")').parent().text().replace('Skor: ', '').trim();
  const producer = $('.infozingle span:contains("Produser")').parent().text().replace('Produser: ', '').trim();
  const type = $('.infozingle span:contains("Tipe")').parent().text().replace('Tipe: ', '').trim();
  const status = $('.infozingle span:contains("Status")').parent().text().replace('Status: ', '').trim();
  const totalEpisode = $('.infozingle span:contains("Total Episode")').parent().text().replace('Total Episode: ', '').trim();
  const duration = $('.infozingle span:contains("Durasi")').parent().text().replace('Durasi: ', '').trim();
  const releaseDate = $('.infozingle span:contains("Tanggal Rilis")').parent().text().replace('Tanggal Rilis: ', '').trim();
  const studio = $('.infozingle span:contains("Studio")').parent().text().replace('Studio: ', '').trim();

  const image = $('.fotoanime img').attr('src') || '';
  const synopsis = $('.sinopc p').text().trim();

  const genres = [];
  $('.infozingle span:contains("Genre")').parent().find('a').each((_, el) => {
    genres.push({
      name: $(el).text().trim(),
      link: $(el).attr('href') || '',
    });
  });

  const episodes = [];
  $('.episodelist ul li').each((_, el) => {
    const $el = $(el);
    const epTitle = $el.find('a').text().trim();
    const epLink = $el.find('a').attr('href') || '';
    const epDate = $el.find('.zemark').text().trim();
    const epSlug = epLink.split('/').filter(Boolean).pop() || '';

    if (epTitle) {
      episodes.push({ title: epTitle, slug: epSlug, date: epDate, link: epLink });
    }
  });

  return {
    title: title || slug.replace(/-/g, ' '),
    japaneseTitle, image, score, producer, type, status,
    totalEpisode, duration, releaseDate, studio, genres, synopsis,
    episodes: episodes.reverse(),
    slug,
  };
}

// Get episode streaming links
export async function getEpisodeStreaming(slug) {
  const remote = await fetchRemote(`/episode/${encodeURIComponent(slug)}`);
  if (remote) return remote;

  const url = `${OTAKUDESU_URL}/episode/${slug}/`;
  const $ = await fetchHTML(url);
  if (!$) return getFallbackEpisode(slug);

  const title = $('.posttl').text().trim() || $('h1.entry-title').text().trim();

  const animeLink = $('.flir a:contains("See All Episodes")').attr('href')
    || $('.naveps .flir a').last().attr('href') || '';
  const animeSlug = animeLink.split('/anime/').pop()?.replace(/\//g, '') || '';

  const prevEp = $('.flir a:first-child').attr('href') || '';
  const nextEp = $('.flir a:last-child').attr('href') || '';
  const prevSlug = prevEp.includes('/episode/') ? prevEp.split('/episode/').pop()?.replace(/\//g, '') : '';
  const nextSlug = nextEp.includes('/episode/') ? nextEp.split('/episode/').pop()?.replace(/\//g, '') : '';

  const mirrors = [];

  $('.mirrorstream ul').each((_, ulEl) => {
    const $ul = $(ulEl);

    let quality = ($ul.attr('class') || '').match(/m(\d+p)/i)?.[1] || '';
    if (!quality) {
      const text = $ul.text().trim();
      const m = text.match(/(\d{3,4})\s*p/i);
      if (m) quality = `${m[1]}p`;
    }
    const label = $ul.prev('label').text().trim();
    quality = quality || label || 'Default';

    $ul.find('li a[data-content]').each((_, el) => {
      const $el = $(el);
      const serverName = $el.text().trim();
      const dataContent = $el.attr('data-content') || '';

      try {
        const decoded = Buffer.from(dataContent, 'base64').toString('utf-8').trim();

        if (decoded.startsWith('{')) {
          const payload = JSON.parse(decoded);
          if (payload.id != null && payload.q) {
            mirrors.push({ quality, server: serverName || 'Server 1', payload: dataContent });
          }
        } else {
          const $decoded = cheerio.load(decoded);
          const iframeSrc = $decoded('iframe').attr('src') || '';
          if (iframeSrc) {
            mirrors.push({
              quality,
              server: serverName || 'Server 1',
              url: iframeSrc.startsWith('//') ? `https:${iframeSrc}` : iframeSrc,
            });
          }
        }
      } catch (e) {
        console.error('Error decoding mirror:', e.message);
      }
    });
  });

  if (mirrors.length === 0) {
    const directIframe = $('#lightsVideo iframe, .responsive-player iframe, #pembed iframe').attr('src');
    if (directIframe) {
      mirrors.push({
        quality: 'Default',
        server: 'Server 1',
        url: directIframe.startsWith('//') ? `https:${directIframe}` : directIframe,
      });
    }
  }

  if (mirrors.length === 0) return getFallbackEpisode(slug);

  const downloads = [];
  $('.download ul li').each((_, el) => {
    const $el = $(el);
    const quality = $el.find('strong').text().trim();
    const links = [];

    $el.find('a').each((_, a) => {
      links.push({
        server: $(a).text().trim(),
        url: $(a).attr('href') || '',
      });
    });

    if (quality && links.length) {
      downloads.push({ quality, links });
    }
  });

  return { title, slug, animeSlug, prevSlug, nextSlug, mirrors, downloads };
}

// Search anime
export async function searchAnime(query) {
  const remote = await fetchRemote(`/search?q=${encodeURIComponent(query)}`);
  if (remote) return remote;

  const url = `${OTAKUDESU_URL}/?s=${encodeURIComponent(query)}&post_type=anime`;
  const $ = await fetchHTML(url);
  if (!$) return [];

  const results = [];

  $('ul.chi_archive li').each((_, el) => {
    const $el = $(el);
    const title = $el.find('h2 a').text().trim();
    const link = $el.find('h2 a').attr('href') || '';
    const image = $el.find('img').attr('src') || '';
    const genres = $el.find('.set b:contains("Genres")').parent().text().replace('Genres : ', '').trim();
    const status = $el.find('.set b:contains("Status")').parent().text().replace('Status : ', '').trim();
    const score = $el.find('.set b:contains("Rating")').parent().text().replace('Rating : ', '').trim();
    const slug = link.split('/anime/').pop()?.replace(/\//g, '') || '';

    if (title) {
      results.push({ title, image, slug, genres, status, score, link });
    }
  });

  return results;
}

// Get release schedule (jadwal rilis) — grouped by day of week
export async function getSchedule() {
  const remote = await fetchRemote('/schedule');
  if (remote) return remote;

  const url = `${OTAKUDESU_URL}/jadwal-rilis/`;
  const $ = await fetchHTML(url);
  if (!$) return [];

  const days = [];
  $('.kgjdwl321 .kglist321').each((_, el) => {
    const $el = $(el);
    const day = $el.find('h2').text().trim();
    const list = [];
    $el.find('ul li a').each((_, a) => {
      const $a = $(a);
      const title = $a.text().trim();
      const link = $a.attr('href') || '';
      const slug = link.split('/anime/').pop()?.replace(/\//g, '') || '';
      if (title) list.push({ title, slug, link });
    });
    if (day && list.length) days.push({ day, anime: list });
  });
  return days;
}

// Get full genre list
export async function getGenreList() {
  const remote = await fetchRemote('/genres');
  if (remote) return remote;

  const url = `${OTAKUDESU_URL}/genre-list/`;
  const $ = await fetchHTML(url);
  if (!$) return [];

  const genres = [];
  const seen = new Set();
  $('.genres ul.genres li a, .genres a, ul.genres li a').each((_, el) => {
    const $el = $(el);
    const name = $el.text().trim();
    const link = $el.attr('href') || '';
    const slug = link.split('/genres/').pop()?.replace(/\//g, '') || '';
    if (name && slug && !seen.has(slug)) {
      seen.add(slug);
      genres.push({ name, slug, link });
    }
  });

  if (genres.length === 0) {
    const fallback = [
      'Action', 'Adventure', 'Comedy', 'Demons', 'Drama', 'Ecchi', 'Fantasy',
      'Game', 'Harem', 'Historical', 'Horror', 'Isekai', 'Josei', 'Magic',
      'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody',
      'Police', 'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi',
      'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Space', 'Sports',
      'Super Power', 'Supernatural', 'Thriller', 'Vampire',
    ];
    return fallback.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      link: `${OTAKUDESU_URL}/genres/${name.toLowerCase().replace(/\s+/g, '-')}/`,
    }));
  }

  return genres;
}

// Get a random anime slug from the latest ongoing + completed pool
export async function getRandomAnimeSlug() {
  const [ongoing, completed] = await Promise.all([
    getOngoingAnime(1),
    getCompletedAnime(1),
  ]);
  const pool = [...(ongoing.anime || []), ...(completed.anime || [])]
    .map((a) => a.slug)
    .filter(Boolean);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Get anime by genre
export async function getAnimeByGenre(genre, page = 1) {
  const remote = await fetchRemote(`/genre/${encodeURIComponent(genre)}?page=${page}`);
  if (remote) return remote;

  const url = `${OTAKUDESU_URL}/genres/${genre}/page/${page}/`;
  const $ = await fetchHTML(url);
  if (!$) return { anime: [], hasNext: false };

  const anime = [];

  $('.col-anime .col-anime-con').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.col-anime-title a').text().trim();
    const link = $el.find('.col-anime-title a').attr('href') || '';
    const image = $el.find('.col-anime-cover img').attr('src') || '';
    const studio = $el.find('.col-anime-studio').text().trim();
    const episodes = $el.find('.col-anime-eps').text().trim();
    const score = $el.find('.col-anime-rating').text().trim();
    const slug = link.split('/anime/').pop()?.replace(/\//g, '') || '';

    if (title) {
      anime.push({ title, image, slug, studio, episodes, score, link });
    }
  });

  const hasNext = $('.pagenavix .next').length > 0;
  return { anime, hasNext };
}
