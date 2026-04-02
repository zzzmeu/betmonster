import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fuseSignals, generateReasoning } from '@/lib/signal-fusion';
import type { Tip, Tipster } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Generate curated picks for today.
 * Runs signal fusion on all pending tips from tracked tipsters.
 */
export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_KEY!;
    const db = createClient(url, key);
    const today = new Date().toISOString().split('T')[0];

    // Get today's pending tips with tipster data
    const { data: tips } = await db
      .from('tips')
      .select('*, tipster:tipsters(*)')
      .eq('match_date', today)
      .eq('result', 'pending');

    if (!tips || tips.length === 0) {
      return NextResponse.json({ success: true, picks: 0, message: 'No pending tips today' });
    }

    // Detect consensus — group by match_name + tip_type
    const consensusMap = new Map<string, number>();
    for (const tip of tips) {
      const key = `${tip.match_name}|${tip.tip_type}`;
      consensusMap.set(key, (consensusMap.get(key) || 0) + 1);
    }

    // Score each tip
    const scored: { tip: Tip & { tipster: Tipster }; signals: ReturnType<typeof fuseSignals>; reasoning: string; consensus: number }[] = [];

    for (const tip of tips) {
      if (!tip.tipster) continue;
      const consensusKey = `${tip.match_name}|${tip.tip_type}`;
      const consensus = consensusMap.get(consensusKey) || 1;
      const signals = fuseSignals(tip as Tip, tip.tipster as Tipster, consensus);
      const reasoning = generateReasoning(signals, tip.tipster as Tipster, tip as Tip);

      scored.push({ tip: tip as Tip & { tipster: Tipster }, signals, reasoning, consensus });
    }

    // Sort by composite score, take top 5
    scored.sort((a, b) => b.signals.composite - a.signals.composite);
    const topPicks = scored.slice(0, 5);

    // Delete old curated picks for today, insert new
    await db.from('curated_picks').delete().eq('pick_date', today);

    for (let i = 0; i < topPicks.length; i++) {
      const { tip, signals, reasoning, consensus } = topPicks[i];
      await db.from('curated_picks').insert({
        tip_id: tip.id,
        rank: i + 1,
        composite_confidence: signals.composite,
        tipster_signal: signals.tipster_signal,
        form_signal: signals.form_signal,
        odds_value_signal: signals.odds_value_signal,
        market_signal: consensus,
        consensus_count: consensus,
        reasoning,
        pick_date: today,
      });
    }

    return NextResponse.json({
      success: true,
      picks: topPicks.length,
      topPick: topPicks[0] ? {
        match: topPicks[0].tip.match_name,
        tip: topPicks[0].tip.tip_type,
        confidence: topPicks[0].signals.composite,
        tipster: topPicks[0].tip.tipster.username,
      } : null,
      allScored: scored.length,
    });
  } catch (error) {
    console.error('[curate] Failed:', error);
    return NextResponse.json(
      { error: 'Curation failed', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
