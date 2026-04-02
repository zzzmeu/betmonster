import { NextResponse } from 'next/server';
import { enrichAllPendingTips } from '@/lib/enrichment';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST() {
  try {
    console.log('[enrich] Starting enrichment...');
    const result = await enrichAllPendingTips();
    console.log(`[enrich] Done: ${result.enriched} tips enriched, sources:`, result.sources);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[enrich] Failed:', error);
    return NextResponse.json(
      { error: 'Enrichment failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Also callable via GET (for cron)
  try {
    const result = await enrichAllPendingTips();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[enrich] Failed:', error);
    return NextResponse.json(
      { error: 'Enrichment failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
