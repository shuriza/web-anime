# VPS Scraper API

The service runs the existing scraper with a small in-memory cache. It is intended to run on the VPS while Vercel serves the frontend.

Required environment variables:

```env
PORT=8787
HOST=0.0.0.0
SCRAPER_API_KEY=replace-with-a-long-random-value
CORS_ORIGIN=https://web-anime-taupe.vercel.app
```

Endpoints are protected by `X-API-Key`, except `/health`:

- `GET /health`
- `GET /ongoing?page=1`
- `GET /completed?page=1`
- `GET /anime/:slug`
- `GET /episode/:slug`
- `GET /search?q=...`
- `GET /schedule`
- `GET /genres`
- `GET /genre/:slug?page=1`
- `GET /random`
