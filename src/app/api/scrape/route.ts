import { NextResponse } from 'next/server';
import { scrapeRanking, scrapeTodaysTips } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.SUPABASE_SERVICE_KEY;
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ranking = await scrapeRanking();
    const todaysTips = await scrapeTodaysTips();

    // TODO: Store in Supabase, run scoring pipeline
    // For now, return raw data
    return NextResponse.json({
      success: true,
      tipsters: ranking.length,
      todaysTips: todaysTips.length,
      data: { ranking: ranking.slice(0, 5), todaysTips: todaysTips.slice(0, 5) },
    });
  } catch (error) {
    console.error('Scrape failed:', error);
    return NextResponse.json(
      { error: 'Scrape failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Scrape endpoint ready. Use POST to trigger.' });
}
