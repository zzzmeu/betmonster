import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from '@/components/confidence-badge';
import { TierBadge } from '@/components/tier-badge';
import { Crosshair, Filter } from 'lucide-react';
import type { CuratedPick, Tip, Tipster } from '@/types';

// Demo picks for today
const allPicks: (Tip & { tipster: Tipster; curated?: { composite_confidence: number; rank?: number } })[] = [
  {
    id: 1, tipster_id: 1, match_name: 'Arsenal - Chelsea', league: 'Premier League', sport: 'soccer',
    tip_type: '1', stake: 10, odds: 1.85, final_score: null, result: 'pending',
    match_date: '2026-04-02', match_time: '17:30', bookmaker: '1xbet',
    home_form: null, away_form: null, h2h_record: null, fair_odds: null,
    odds_movement: null, polymarket_prob: null, composite_score: 0.82, created_at: '',
    tipster: {
      id: 1, typersi_id: 44116, username: 'outlaw76', profile_url: null,
      total_tips: 150, wins: 102, losses: 48, avg_odds: 2.1, profit_units: 137.1,
      win_rate: 68, bayesian_rating: 8.57, roi: 15.2, consistency_score: 72,
      specialization: {}, streak_current: 5, streak_best: 12, tier: 'elite',
      last_scraped_at: null, created_at: '', updated_at: '',
    },
    curated: { composite_confidence: 0.82, rank: 1 },
  },
  {
    id: 2, tipster_id: 2, match_name: 'Sevilla - Real Madrid', league: 'La Liga', sport: 'soccer',
    tip_type: '2', stake: 20, odds: 2.10, final_score: null, result: 'pending',
    match_date: '2026-04-02', match_time: '20:00', bookmaker: '1xbet',
    home_form: null, away_form: null, h2h_record: null, fair_odds: null,
    odds_movement: null, polymarket_prob: null, composite_score: 0.74, created_at: '',
    tipster: {
      id: 2, typersi_id: 48750, username: 'Baloniarz', profile_url: null,
      total_tips: 85, wins: 52, losses: 33, avg_odds: 1.95, profit_units: 132.0,
      win_rate: 61.2, bayesian_rating: 6.8, roi: 11.8, consistency_score: 65,
      specialization: {}, streak_current: 3, streak_best: 8, tier: 'proven',
      last_scraped_at: null, created_at: '', updated_at: '',
    },
    curated: { composite_confidence: 0.74, rank: 2 },
  },
  {
    id: 3, tipster_id: 3, match_name: 'Bayern Munich - Dortmund', league: 'Bundesliga', sport: 'soccer',
    tip_type: 'Over 2.5', stake: 15, odds: 1.72, final_score: null, result: 'pending',
    match_date: '2026-04-02', match_time: '18:30', bookmaker: '1xbet',
    home_form: null, away_form: null, h2h_record: null, fair_odds: null,
    odds_movement: null, polymarket_prob: null, composite_score: 0.69, created_at: '',
    tipster: {
      id: 3, typersi_id: 50752, username: 'Kolba1', profile_url: null,
      total_tips: 42, wins: 27, losses: 15, avg_odds: 1.88, profit_units: 97.5,
      win_rate: 64.3, bayesian_rating: 4.7, roi: 8.5, consistency_score: 58,
      specialization: {}, streak_current: 2, streak_best: 6, tier: 'rising',
      last_scraped_at: null, created_at: '', updated_at: '',
    },
    curated: { composite_confidence: 0.69, rank: 3 },
  },
  {
    id: 4, tipster_id: 4, match_name: 'Skive - AB Copenhagen', league: 'Denmark 1st Division', sport: 'soccer',
    tip_type: '2', stake: 30, odds: 1.57, final_score: null, result: 'pending',
    match_date: '2026-04-02', match_time: '14:00', bookmaker: '1xbet',
    home_form: null, away_form: null, h2h_record: null, fair_odds: null,
    odds_movement: null, polymarket_prob: null, composite_score: 0.45, created_at: '',
    tipster: {
      id: 7, typersi_id: 25432, username: 'gregory198', profile_url: null,
      total_tips: 12, wins: 6, losses: 6, avg_odds: 1.82, profit_units: -8.5,
      win_rate: 50, bayesian_rating: -0.39, roi: -4.2, consistency_score: 30,
      specialization: {}, streak_current: 0, streak_best: 3, tier: 'unranked',
      last_scraped_at: null, created_at: '', updated_at: '',
    },
  },
];

export default function PicksPage() {
  const sorted = [...allPicks].sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            All <span className="text-[#39FF14]">Picks</span> Today
          </h1>
          <p className="text-zinc-500 mt-1">Every tip tracked — curated picks highlighted</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Filter className="h-4 w-4" />
          {sorted.length} picks
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="py-3 px-3 text-left">Confidence</th>
              <th className="py-3 px-3 text-left">Time</th>
              <th className="py-3 px-3 text-left">Match</th>
              <th className="py-3 px-3 text-left">League</th>
              <th className="py-3 px-3 text-center">Tip</th>
              <th className="py-3 px-3 text-right">Odds</th>
              <th className="py-3 px-3 text-left">Tipster</th>
              <th className="py-3 px-3 text-center">Tier</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(pick => (
              <tr
                key={pick.id}
                className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 ${
                  pick.curated ? 'bg-[#39FF14]/[0.02]' : ''
                }`}
              >
                <td className="py-3 px-3">
                  {pick.composite_score ? (
                    <ConfidenceBadge confidence={pick.composite_score} size="sm" />
                  ) : (
                    <span className="text-zinc-600 text-xs">N/A</span>
                  )}
                </td>
                <td className="py-3 px-3 text-zinc-400 font-mono">{pick.match_time}</td>
                <td className="py-3 px-3 text-white font-medium">{pick.match_name}</td>
                <td className="py-3 px-3 text-zinc-500">{pick.league}</td>
                <td className="py-3 px-3 text-center">
                  <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-white font-mono">
                    {pick.tip_type}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-right font-mono text-zinc-300">{pick.odds}</td>
                <td className="py-3 px-3 text-zinc-300">{pick.tipster.username}</td>
                <td className="py-3 px-3 text-center">
                  <TierBadge tier={pick.tipster.tier} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
