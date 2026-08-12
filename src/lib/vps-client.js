const REMOTE_API = process.env.SCRAPER_API_URL?.replace(/\/$/, '');

export async function fetchRemote(path) {
  if (!REMOTE_API) return null;

  try {
    const response = await fetch(`${REMOTE_API}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(process.env.SCRAPER_API_KEY
          ? { 'X-API-Key': process.env.SCRAPER_API_KEY }
          : {}),
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`Remote scraper HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error(`Remote scraper error for ${path}:`, error.message);
    return null;
  }
}
