import { createClient } from '@supabase/supabase-js';
import { scoreTipster } from './scoring';
import type { ScrapedTipster, ScrapedProfile, ScrapedDailyTip } from './scraper';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key);
}

/**
 * Upsert tipsters and their tips, run scoring, save snapshots.
 */
export async function persistScrapeResults(
  ranking: ScrapedTipster[],
  profiles: Map<number, ScrapedProfile>,
  todaysTips: ScrapedDailyTip[]
): Promise<{ tipstersUpserted: number; tipsUpserted: number; snapshotsSaved: number }> {
  const db = getClient();
  let tipstersUpserted = 0;
  let tipsUpserted = 0;
  let snapshotsSaved = 0;
  const today = new Date().toISOString().split('T')[0];

  // 1. Upsert tipsters
  for (const t of ranking) {
    const profile = profiles.get(t.typersi_id);

    // Ranking page gives reliable profit_units; profile may fail (JS-rendered)
    const pStats = profile || { profit_units: 0, total_tips: 0, wins: 0, losses: 0, avg_odds: 0, win_rate: 0 };
    const profitUnits = pStats.profit_units || t.profit_units || 0;

    const tipsterData: Record<string, unknown> = {
      typersi_id: t.typersi_id,
      username: t.username,
      profile_url: t.profile_url,
      profit_units: profitUnits,
      total_tips: pStats.total_tips || 0,
      wins: pStats.wins || 0,
      losses: pStats.losses || 0,
      avg_odds: pStats.avg_odds || 0,
      win_rate: pStats.win_rate || 0,
      last_scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: upserted, error: tipsterErr } = await db
      .from('tipsters')
      .upsert(tipsterData, { onConflict: 'typersi_id' })
      .select('id, typersi_id')
      .single();

    if (tipsterErr) {
      console.error(`Failed to upsert tipster ${t.username}:`, tipsterErr);
      continue;
    }
    tipstersUpserted++;

    const tipsterId = upserted.id;

    // 2. Upsert tips for this tipster
    if (profile?.tips) {
      for (const tip of profile.tips) {
        const tipData = {
          tipster_id: tipsterId,
          match_name: tip.match_name,
          league: tip.league || null,
          sport: tip.sport || 'soccer',
          tip_type: tip.tip_type,
          stake: tip.stake || null,
          odds: tip.odds,
          final_score: tip.final_score || null,
          result: tip.result,
          match_date: tip.match_date || today,
          match_time: tip.match_time || null,
          bookmaker: tip.bookmaker || null,
        };

        const { error: tipErr } = await db
          .from('tips')
          .upsert(tipData, { onConflict: 'tipster_id,match_name,match_date,tip_type' });

        if (!tipErr) tipsUpserted++;
      }
    }

    // 3. Run scoring pipeline
    // Use stored tips if they have results, otherwise use profile stats
    const { data: allTips } = await db
      .from('tips')
      .select('*')
      .eq('tipster_id', tipsterId);

    const settledTips = (allTips || []).filter((tp: Record<string, unknown>) => tp.result === 'win' || tp.result === 'loss');
    const totalStoredTips = (allTips || []).length;
    
    if (settledTips.length > 0) {
      // We have resolved tips — use the scoring engine
      const scores = scoreTipster(allTips!);
      await db.from('tipsters').update({
        bayesian_rating: scores.bayesian_rating,
        roi: scores.roi,
        consistency_score: scores.consistency_score,
        tier: scores.tier,
        specialization: scores.specialization,
        win_rate: scores.win_rate,
        profit_units: scores.profit_units,
        total_tips: settledTips.length,
        wins: settledTips.filter((tp: Record<string, unknown>) => tp.result === 'win').length,
        losses: settledTips.filter((tp: Record<string, unknown>) => tp.result === 'loss').length,
      }).eq('id', tipsterId);
    } else {
      // No settled tips — use ranking page profit_units for Bayesian rating
      // Use total stored tips OR profile total_tips (whichever is greater)
      const { calculateBayesianRating, calculateTier } = await import('./scoring');
      const tipsCount = Math.max(totalStoredTips, pStats.total_tips || 0);
      
      if (profitUnits !== 0 || tipsCount > 0) {
        const bayesian = calculateBayesianRating(tipsCount || 1, profitUnits);
        const roi = tipsCount > 0 ? (profitUnits / (tipsCount * 10)) * 100 : 0;
        const winRate = pStats.win_rate || (profitUnits > 0 ? 60 : 40); // rough estimate
        const tier = calculateTier({ total_tips: tipsCount, bayesian_rating: bayesian, roi, win_rate: winRate });
        
        await db.from('tipsters').update({
          bayesian_rating: bayesian,
          roi: roi,
          tier: tier,
          profit_units: profitUnits,
          total_tips: tipsCount,
        }).eq('id', tipsterId);
      }
    }

    // 4. Save daily snapshot
    const { error: snapErr } = await db
      .from('tipster_snapshots')
      .upsert({
        tipster_id: tipsterId,
        snapshot_date: today,
        profit_units: profile?.profit_units ?? 0,
        win_rate: profile?.win_rate ?? 0,
        bayesian_rating: 0, // Will be updated after scoring
        total_tips: profile?.total_tips ?? 0,
      }, { onConflict: 'tipster_id,snapshot_date' });

    if (!snapErr) snapshotsSaved++;
  }

  // 5. Also upsert today's tips from non-profiled tipsters
  for (const dt of todaysTips) {
    if (!dt.tipster_typersi_id) continue;
    
    // Find or create tipster
    const { data: tipster } = await db
      .from('tipsters')
      .select('id')
      .eq('typersi_id', dt.tipster_typersi_id)
      .single();

    if (!tipster) continue;

    const tipData = {
      tipster_id: tipster.id,
      match_name: dt.match_name,
      sport: dt.sport,
      tip_type: dt.tip_type,
      stake: dt.stake || null,
      odds: dt.odds,
      match_date: dt.match_date || today,
      match_time: dt.match_time || null,
      result: 'pending' as const,
    };

    await db
      .from('tips')
      .upsert(tipData, { onConflict: 'tipster_id,match_name,match_date,tip_type' });
  }

  return { tipstersUpserted, tipsUpserted, snapshotsSaved };
}

/**
 * Update algo performance tracking — check yesterday's curated picks.
 */
export async function updateAlgoPerformance(): Promise<void> {
  const db = getClient();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const { data: picks } = await db
    .from('curated_picks')
    .select('*, tip:tips(*)')
    .eq('pick_date', dateStr);

  if (!picks || picks.length === 0) return;

  let wins = 0, losses = 0, voids = 0, pending = 0, profitUnits = 0;
  let totalConf = 0, totalOdds = 0;

  for (const pick of picks) {
    const tip = pick.tip;
    if (!tip) continue;
    totalConf += pick.composite_confidence;
    totalOdds += tip.odds;

    if (tip.result === 'win') {
      wins++;
      profitUnits += (tip.stake || 10) * (tip.odds - 1);
    } else if (tip.result === 'loss') {
      losses++;
      profitUnits -= (tip.stake || 10);
    } else if (tip.result === 'void') {
      voids++;
    } else {
      pending++;
    }
  }

  const total = picks.length;
  const settled = wins + losses;
  const winRate = settled > 0 ? (wins / settled) * 100 : 0;

  await db.from('algo_performance').upsert({
    pick_date: dateStr,
    total_picks: total,
    wins,
    losses,
    voids,
    pending,
    win_rate: winRate,
    profit_units: profitUnits,
    avg_confidence: total > 0 ? totalConf / total : 0,
    avg_odds: total > 0 ? totalOdds / total : 0,
  }, { onConflict: 'pick_date' });
}
