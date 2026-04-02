import { NextResponse } from 'next/server';
import { scrapeAll } from '@/lib/scraper';
import { persistScrapeResults, updateAlgoPerformance } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Allow up to 2 min for full scrape

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.SUPABASE_SERVICE_KEY;
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[scrape] Starting full scrape...');
    const { ranking, profiles, todaysTips } = await scrapeAll(30);
    console.log(`[scrape] Scraped ${ranking.length} tipsters, ${profiles.size} profiles, ${todaysTips.length} today's tips`);

    const result = await persistScrapeResults(ranking, profiles, todaysTips);
    console.log(`[scrape] Persisted: ${result.tipstersUpserted} tipsters, ${result.tipsUpserted} tips, ${result.snapshotsSaved} snapshots`);

    // Also update yesterday's algo performance
    await updateAlgoPerformance();

    return NextResponse.json({
      success: true,
      scraped: {
        tipsters: ranking.length,
        profiles: profiles.size,
        todaysTips: todaysTips.length,
      },
      persisted: result,
    });
  } catch (error) {
    console.error('[scrape] Failed:', error);
    return NextResponse.json(
      { error: 'Scrape failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// Vercel cron hits GET
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Allow cron or service key
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    if (serviceKey && authHeader !== `Bearer ${serviceKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Run same logic as POST
  try {
    const { ranking, profiles, todaysTips } = await scrapeAll(30);
    const result = await persistScrapeResults(ranking, profiles, todaysTips);
    await updateAlgoPerformance();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[cron scrape] Failed:', error);
    return NextResponse.json(
      { error: 'Scrape failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
