'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TierBadge } from '@/components/tier-badge';
import { PerformanceChart } from '@/components/performance-chart';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Zap, Award, Flame, BarChart3, Calendar } from 'lucide-react';
import type { Tipster, TipsterSnapshot, Tip } from '@/types';

// Demo data
const demoTipster: Tipster = {
  id: 1, typersi_id: 44116, username: 'outlaw76', profile_url: null,
  total_tips: 150, wins: 102, losses: 48, avg_odds: 2.1, profit_units: 137.1,
  win_rate: 68, bayesian_rating: 8.57, roi: 15.2, consistency_score: 72,
  specialization: {
    'Premier League': { wins: 45, losses: 18, win_rate: 71.4 },
    'La Liga': { wins: 22, losses: 12, win_rate: 64.7 },
    'Champions League': { wins: 18, losses: 8, win_rate: 69.2 },
    'Bundesliga': { wins: 10, losses: 6, win_rate: 62.5 },
  },
  streak_current: 5, streak_best: 12, tier: 'elite',
  last_scraped_at: new Date().toISOString(), created_at: '', updated_at: '',
};

const demoSnapshots: TipsterSnapshot[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  tipster_id: 1,
  snapshot_date: new Date(Date.now() - (59 - i) * 86400000).toISOString().split('T')[0],
  profit_units: 40 + Math.sin(i / 5) * 15 + i * 1.6,
  win_rate: 58 + Math.sin(i / 7) * 8 + (i > 30 ? 5 : 0),
  bayesian_rating: 3 + Math.sin(i / 6) * 2 + i * 0.09,
  total_tips: 90 + i,
}));

// Monthly summaries demo
const demoMonthly = [
  { month: '2026-01-01', total_tips: 45, wins: 28, losses: 17, profit_units: 32.5, win_rate: 62.2, avg_odds: 2.05, rank_end: 8 },
  { month: '2026-02-01', total_tips: 52, wins: 35, losses: 17, profit_units: 48.2, win_rate: 67.3, avg_odds: 2.12, rank_end: 4 },
  { month: '2026-03-01', total_tips: 48, wins: 34, losses: 14, profit_units: 56.4, win_rate: 70.8, avg_odds: 2.08, rank_end: 2 },
  { month: '2026-04-01', total_tips: 5, wins: 5, losses: 0, profit_units: 137.1, win_rate: 100, avg_odds: 3.29, rank_end: 1 },
];

const demoTips: Tip[] = [
  { id: 1, tipster_id: 1, match_name: 'Arsenal - Chelsea', league: 'Premier League', sport: 'soccer', tip_type: '1', stake: 10, odds: 1.85, final_score: '2:1', result: 'win', match_date: '2026-04-01', match_time: '17:30', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 2, tipster_id: 1, match_name: 'Man City - Liverpool', league: 'Premier League', sport: 'soccer', tip_type: 'Over 2.5', stake: 15, odds: 1.72, final_score: '3:2', result: 'win', match_date: '2026-03-30', match_time: '15:00', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 3, tipster_id: 1, match_name: 'Barcelona - Atletico', league: 'La Liga', sport: 'soccer', tip_type: '1', stake: 20, odds: 1.90, final_score: '1:2', result: 'loss', match_date: '2026-03-28', match_time: '20:00', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 4, tipster_id: 1, match_name: 'Bayern - Dortmund', league: 'Bundesliga', sport: 'soccer', tip_type: '1', stake: 10, odds: 1.65, final_score: '3:0', result: 'win', match_date: '2026-03-26', match_time: '18:30', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 5, tipster_id: 1, match_name: 'PSG - Marseille', league: 'Ligue 1', sport: 'soccer', tip_type: '1', stake: 10, odds: 1.55, final_score: '2:0', result: 'win', match_date: '2026-03-24', match_time: '21:00', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 6, tipster_id: 1, match_name: 'Tottenham - West Ham', league: 'Premier League', sport: 'soccer', tip_type: '1', stake: 10, odds: 1.75, final_score: '1:0', result: 'win', match_date: '2026-03-22', match_time: '16:00', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
];

export default function TipsterProfile() {
  const t = demoTipster;

  return (
    <div className="space-y-5">
      {/* Hero — mobile-stacked */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-zinc-800 flex items-center justify-center text-xl font-bold text-[#39FF14] shrink-0">
          {t.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold truncate">{t.username}</h1>
            <TierBadge tier={t.tier} />
          </div>
          <p className="text-zinc-500 text-xs mt-0.5">
            {t.total_tips} tips tracked · Last updated {t.last_scraped_at ? 'today' : 'never'}
          </p>
        </div>
      </div>

      {/* Key Stats — responsive grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <HeroStat icon={BarChart3} label="Rating" value={t.bayesian_rating.toFixed(2)} accent />
        <HeroStat icon={Target} label="Win %" value={`${t.win_rate}%`} />
        <HeroStat icon={TrendingUp} label="ROI" value={`${t.roi}%`} positive={t.roi > 0} />
        <HeroStat icon={Zap} label="Tips" value={t.total_tips.toString()} />
        <HeroStat icon={Award} label="Profit" value={`${t.profit_units > 0 ? '+' : ''}${t.profit_units}u`} positive={t.profit_units > 0} />
        <HeroStat icon={Flame} label="Streak" value={`${t.streak_current}`} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-zinc-400">Profit Over Time (60 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={demoSnapshots} metric="profit_units" height={220} />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-zinc-400">Win Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={demoSnapshots} metric="win_rate" height={220} />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance — THE cross-month comparison */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-zinc-400 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Monthly Performance (Cross-Month History)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                  <th className="py-2 px-2 text-left">Month</th>
                  <th className="py-2 px-2 text-center">Tips</th>
                  <th className="py-2 px-2 text-center">W/L</th>
                  <th className="py-2 px-2 text-center">Win %</th>
                  <th className="py-2 px-2 text-right">Profit</th>
                  <th className="py-2 px-2 text-center hidden md:table-cell">Avg Odds</th>
                  <th className="py-2 px-2 text-center hidden md:table-cell">Rank</th>
                </tr>
              </thead>
              <tbody>
                {demoMonthly.map(m => {
                  const monthLabel = new Date(m.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                  return (
                    <tr key={m.month} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 px-2 text-zinc-300 font-medium text-xs">{monthLabel}</td>
                      <td className="py-2 px-2 text-center text-zinc-400">{m.total_tips}</td>
                      <td className="py-2 px-2 text-center">
                        <span className="text-[#39FF14]">{m.wins}</span>
                        <span className="text-zinc-600"> / </span>
                        <span className="text-red-400">{m.losses}</span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Badge variant="outline" className={
                          m.win_rate >= 70 ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30 text-xs' :
                          m.win_rate >= 60 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs'
                        }>
                          {m.win_rate.toFixed(0)}%
                        </Badge>
                      </td>
                      <td className={`py-2 px-2 text-right font-mono text-xs ${m.profit_units >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
                        {m.profit_units >= 0 ? '+' : ''}{m.profit_units.toFixed(1)}u
                      </td>
                      <td className="py-2 px-2 text-center text-zinc-500 hidden md:table-cell">{m.avg_odds.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center text-zinc-400 hidden md:table-cell">#{m.rank_end}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2">
            Typersi resets rankings monthly. We track across resets. Consistent top-10 placement across 3+ months = genuine edge.
          </p>
        </CardContent>
      </Card>

      {/* Specialization */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-zinc-400">Specialization by League</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(t.specialization).map(([league, stats]) => (
              <div key={league} className="bg-zinc-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs font-medium text-white truncate">{league}</div>
                <div className="text-[#39FF14] font-mono font-bold">{stats.win_rate.toFixed(0)}%</div>
                <div className="text-[10px] text-zinc-500">{stats.wins}W / {stats.losses}L</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tip History */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-zinc-400">Recent Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                  <th className="py-2 px-2 text-left">Date</th>
                  <th className="py-2 px-2 text-left">Match</th>
                  <th className="py-2 px-2 text-center">Tip</th>
                  <th className="py-2 px-2 text-right">Odds</th>
                  <th className="py-2 px-2 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {demoTips.map(tip => (
                  <tr key={tip.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-2 px-2 text-zinc-400 text-xs">{tip.match_date}</td>
                    <td className="py-2 px-2 text-white text-xs font-medium truncate max-w-[150px] md:max-w-none">{tip.match_name}</td>
                    <td className="py-2 px-2 text-center">
                      <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-white text-xs">{tip.tip_type}</Badge>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-zinc-300 text-xs">{tip.odds}</td>
                    <td className="py-2 px-2 text-center">
                      <Badge variant="outline" className={
                        tip.result === 'win' ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30 text-xs' :
                        tip.result === 'loss' ? 'bg-red-500/10 text-red-400 border-red-500/30 text-xs' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700 text-xs'
                      }>
                        {tip.result === 'win' ? '✓' : tip.result === 'loss' ? '✗' : '…'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HeroStat({ icon: Icon, label, value, accent, positive }: { icon: React.ElementType; label: string; value: string; accent?: boolean; positive?: boolean }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-2 md:p-3 text-center">
        <Icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${accent ? 'text-[#39FF14]' : 'text-zinc-600'}`} />
        <div className={`text-sm md:text-lg font-bold font-mono ${accent ? 'text-[#39FF14]' : positive === true ? 'text-[#39FF14]' : positive === false ? 'text-red-400' : 'text-white'}`}>
          {value}
        </div>
        <div className="text-[9px] md:text-[10px] text-zinc-500">{label}</div>
      </CardContent>
    </Card>
  );
}
