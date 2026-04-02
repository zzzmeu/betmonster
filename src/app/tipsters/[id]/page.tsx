'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TierBadge } from '@/components/tier-badge';
import { PerformanceChart } from '@/components/performance-chart';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Zap, Award, Flame, BarChart3 } from 'lucide-react';
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

const demoSnapshots: TipsterSnapshot[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  tipster_id: 1,
  snapshot_date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  profit_units: 80 + Math.random() * 60 + i * 1.5,
  win_rate: 60 + Math.random() * 15,
  bayesian_rating: 5 + Math.random() * 4 + i * 0.1,
  total_tips: 120 + i,
}));

const demoTips: Tip[] = [
  { id: 1, tipster_id: 1, match_name: 'Arsenal - Chelsea', league: 'Premier League', sport: 'soccer', tip_type: '1', stake: 10, odds: 1.85, final_score: '2:1', result: 'win', match_date: '2026-04-01', match_time: '17:30', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 2, tipster_id: 1, match_name: 'Man City - Liverpool', league: 'Premier League', sport: 'soccer', tip_type: 'Over 2.5', stake: 15, odds: 1.72, final_score: '3:2', result: 'win', match_date: '2026-03-30', match_time: '15:00', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 3, tipster_id: 1, match_name: 'Barcelona - Atletico', league: 'La Liga', sport: 'soccer', tip_type: '1', stake: 20, odds: 1.90, final_score: '1:2', result: 'loss', match_date: '2026-03-28', match_time: '20:00', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 4, tipster_id: 1, match_name: 'Bayern - Dortmund', league: 'Bundesliga', sport: 'soccer', tip_type: '1', stake: 10, odds: 1.65, final_score: '3:0', result: 'win', match_date: '2026-03-26', match_time: '18:30', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
  { id: 5, tipster_id: 1, match_name: 'PSG - Marseille', league: 'Ligue 1', sport: 'soccer', tip_type: '1', stake: 10, odds: 1.55, final_score: '2:0', result: 'win', match_date: '2026-03-24', match_time: '21:00', bookmaker: '1xbet', home_form: null, away_form: null, h2h_record: null, fair_odds: null, odds_movement: null, polymarket_prob: null, composite_score: null, created_at: '' },
];

export default function TipsterProfile() {
  const t = demoTipster;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl font-bold text-[#39FF14]">
            {t.username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{t.username}</h1>
              <TierBadge tier={t.tier} />
            </div>
            <p className="text-zinc-500 text-sm">
              Tracked since {new Date(t.created_at || Date.now()).toLocaleDateString()} · Last updated {t.last_scraped_at ? 'today' : 'never'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <HeroStat icon={BarChart3} label="Rating" value={t.bayesian_rating.toFixed(2)} accent />
        <HeroStat icon={Target} label="Win Rate" value={`${t.win_rate}%`} />
        <HeroStat icon={TrendingUp} label="ROI" value={`${t.roi}%`} positive={t.roi > 0} />
        <HeroStat icon={Zap} label="Tips" value={t.total_tips.toString()} />
        <HeroStat icon={Award} label="Profit" value={`${t.profit_units > 0 ? '+' : ''}${t.profit_units}u`} positive={t.profit_units > 0} />
        <HeroStat icon={Flame} label="Streak" value={`${t.streak_current} (best: ${t.streak_best})`} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Profit Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={demoSnapshots} metric="profit_units" />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Win Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={demoSnapshots} metric="win_rate" />
          </CardContent>
        </Card>
      </div>

      {/* Specialization */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400">Specialization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(t.specialization).map(([league, stats]) => (
              <div key={league} className="bg-zinc-800/50 rounded-lg px-4 py-3 text-center">
                <div className="text-sm font-medium text-white">{league}</div>
                <div className="text-[#39FF14] font-mono font-bold">{stats.win_rate.toFixed(0)}%</div>
                <div className="text-xs text-zinc-500">{stats.wins}W / {stats.losses}L</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tip History */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400">Recent Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Match</th>
                  <th className="py-2 px-3 text-left">League</th>
                  <th className="py-2 px-3 text-center">Tip</th>
                  <th className="py-2 px-3 text-right">Odds</th>
                  <th className="py-2 px-3 text-center">Score</th>
                  <th className="py-2 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {demoTips.map(tip => (
                  <tr key={tip.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-2 px-3 text-zinc-400">{tip.match_date}</td>
                    <td className="py-2 px-3 text-white font-medium">{tip.match_name}</td>
                    <td className="py-2 px-3 text-zinc-500">{tip.league}</td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-white">{tip.tip_type}</Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-300">{tip.odds}</td>
                    <td className="py-2 px-3 text-center text-zinc-400">{tip.final_score || '-'}</td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant="outline" className={
                        tip.result === 'win' ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30' :
                        tip.result === 'loss' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }>
                        {tip.result.toUpperCase()}
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
      <CardContent className="p-3 text-center">
        <Icon className={`h-4 w-4 mx-auto mb-1 ${accent ? 'text-[#39FF14]' : 'text-zinc-600'}`} />
        <div className={`text-lg font-bold font-mono ${accent ? 'text-[#39FF14]' : positive === true ? 'text-[#39FF14]' : positive === false ? 'text-red-400' : 'text-white'}`}>
          {value}
        </div>
        <div className="text-[10px] text-zinc-500">{label}</div>
      </CardContent>
    </Card>
  );
}
