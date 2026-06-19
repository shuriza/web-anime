import { NextResponse } from 'next/server';
import { getRandomAnimeSlug } from '@/lib/scraper';

export const revalidate = 600;

export async function GET() {
  const slug = await getRandomAnimeSlug();
  if (!slug) {
    return NextResponse.json({ error: 'No anime available' }, { status: 503 });
  }
  return NextResponse.json({ slug });
}
