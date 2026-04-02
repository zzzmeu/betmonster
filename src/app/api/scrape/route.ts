import { NextResponse } from 'next/server';
import { scrapeAll } from '@/lib/scraper';
import { persistScrapeResults, updateAlgoPerformance } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function runScrape() {
  console.log('[scrape] Starting full scrape...');
  const { ranking, profiles, todaysTips } = await scrapeAll(30);
  console.log(`[scrape] Scraped ${ranking.length} tipsters, ${profiles.size} profiles, ${todaysTips.length} today's tips`);

  const result = await persistScrapeResults(ranking, profiles, todaysTips);
  console.log(`[scrape] Persisted: ${result.tipstersUpserted} tipsters, ${result.tipsUpserted} tips, ${result.snapshotsSaved} snapshots`);

  await updateAlgoPerformance();

  return {
    success: true,
    scraped: { tipsters: ranking.length, profiles: profiles.size, todaysTips: todaysTips.length },
    persisted: result,
  };
}

export async function POST() {
  try {
    const result = await runScrape();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[scrape] Failed:', error);
    return NextResponse.json(
      { error: 'Scrape failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await runScrape();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[cron scrape] Failed:', error);
    return NextResponse.json(
      { error: 'Scrape failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
