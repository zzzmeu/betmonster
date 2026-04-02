import { TipsterCard } from '@/components/tipster-card';
import type { Tipster } from '@/types';

// Demo data — replaced by Supabase query
const demoTipsters: Tipster[] = [
  {
    id: 1, typersi_id: 44116, username: 'outlaw76', profile_url: '/typer/44116/outlaw76',
    total_tips: 150, wins: 102, losses: 48, avg_odds: 2.1, profit_units: 137.1,
    win_rate: 68, bayesian_rating: 8.57, roi: 15.2, consistency_score: 72,
    specialization: { 'Premier League': { wins: 45, losses: 18, win_rate: 71.4 } },
    streak_current: 5, streak_best: 12, tier: 'elite',
    last_scraped_at: new Date().toISOString(), created_at: '', updated_at: '',
  },
  {
    id: 2, typersi_id: 48750, username: 'Baloniarz', profile_url: '/typer/48750/Baloniarz',
    total_tips: 85, wins: 52, losses: 33, avg_odds: 1.95, profit_units: 132.0,
    win_rate: 61.2, bayesian_rating: 6.8, roi: 11.8, consistency_score: 65,
    specialization: { 'La Liga': { wins: 22, losses: 10, win_rate: 68.8 } },
    streak_current: 3, streak_best: 8, tier: 'proven',
    last_scraped_at: new Date().toISOString(), created_at: '', updated_at: '',
  },
  {
    id: 3, typersi_id: 50752, username: 'Kolba1', profile_url: '/typer/50752/Kolba1',
    total_tips: 42, wins: 27, losses: 15, avg_odds: 1.88, profit_units: 97.5,
    win_rate: 64.3, bayesian_rating: 4.7, roi: 8.5, consistency_score: 58,
    specialization: { 'Bundesliga': { wins: 15, losses: 7, win_rate: 68.2 } },
    streak_current: 2, streak_best: 6, tier: 'rising',
    last_scraped_at: new Date().toISOString(), created_at: '', updated_at: '',
  },
  {
    id: 4, typersi_id: 64535, username: 'robcamp78', profile_url: '/typer/64535/robcamp78',
    total_tips: 35, wins: 22, losses: 13, avg_odds: 2.05, profit_units: 77.5,
    win_rate: 62.9, bayesian_rating: 3.9, roi: 7.2, consistency_score: 55,
    specialization: {},
    streak_current: 1, streak_best: 5, tier: 'rising',
    last_scraped_at: new Date().toISOString(), created_at: '', updated_at: '',
  },
  {
    id: 5, typersi_id: 27646, username: 'zajac', profile_url: '/typer/27646/zajac',
    total_tips: 60, wins: 35, losses: 25, avg_odds: 1.92, profit_units: 63.9,
    win_rate: 58.3, bayesian_rating: 3.1, roi: 5.8, consistency_score: 50,
    specialization: {},
    streak_current: 0, streak_best: 7, tier: 'rising',
    last_scraped_at: new Date().toISOString(), created_at: '', updated_at: '',
  },
  {
    id: 6, typersi_id: 34997, username: 'zbyszek57', profile_url: '/typer/34997/zbyszek57',
    total_tips: 8, wins: 5, losses: 3, avg_odds: 2.3, profit_units: 53.7,
    win_rate: 62.5, bayesian_rating: 2.98, roi: 22.1, consistency_score: 0,
    specialization: {},
    streak_current: 2, streak_best: 3, tier: 'unranked',
    last_scraped_at: new Date().toISOString(), created_at: '', updated_at: '',
  },
];

export default function TipstersPage() {
  const sorted = [...demoTipsters].sort((a, b) => b.bayesian_rating - a.bayesian_rating);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Tipster <span className="text-[#39FF14]">Rankings</span>
        </h1>
        <p className="text-zinc-500 mt-1">
          Bayesian-rated — sample size matters. Lucky streaks filtered out.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((tipster, i) => (
          <TipsterCard key={tipster.id} tipster={tipster} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
