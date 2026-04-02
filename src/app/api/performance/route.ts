import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ performance: [], source: 'no-db' });
  }

  const db = createClient(url, key);

  const { data } = await db
    .from('algo_performance')
    .select('*')
    .order('pick_date', { ascending: false })
    .limit(90);

  // Calculate running totals
  let totalWins = 0, totalLosses = 0, totalProfit = 0;
  const reversed = [...(data || [])].reverse();
  const withRunning = reversed.map(d => {
    totalWins += d.wins;
    totalLosses += d.losses;
    totalProfit += d.profit_units;
    const totalSettled = totalWins + totalLosses;
    return {
      ...d,
      running_wins: totalWins,
      running_losses: totalLosses,
      running_profit: totalProfit,
      running_win_rate: totalSettled > 0 ? (totalWins / totalSettled) * 100 : 0,
    };
  });

  return NextResponse.json({
    performance: withRunning,
    summary: {
      total_days: (data || []).length,
      total_picks: (data || []).reduce((s, d) => s + d.total_picks, 0),
      total_wins: totalWins,
      total_losses: totalLosses,
      overall_win_rate: (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0,
      total_profit: totalProfit,
    },
    source: 'live',
  });
}
