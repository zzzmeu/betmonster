import { TipsterCard } from '@/components/tipster-card';
import { getTipsters } from '@/lib/data';
import type { Tipster } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 min cache

// Fallback demo data when DB is empty
const demoTipsters: Tipster[] = [
  { id: 1, typersi_id: 44116, username: 'outlaw76', profile_url: null, total_tips: 2, wins: 2, losses: 0, avg_odds: 3.29, profit_units: 137.1, win_rate: 100, bayesian_rating: 11.43, roi: 128.2, consistency_score: 0, specialization: {}, streak_current: 2, streak_best: 2, tier: 'unranked', last_scraped_at: null, created_at: '', updated_at: '' },
  { id: 2, typersi_id: 48750, username: 'Baloniarz', profile_url: null, total_tips: 3, wins: 3, losses: 0, avg_odds: 2.47, profit_units: 132.0, win_rate: 100, bayesian_rating: 10.15, roi: 146.7, consistency_score: 0, specialization: {}, streak_current: 3, streak_best: 3, tier: 'unranked', last_scraped_at: null, created_at: '', updated_at: '' },
];

export default async function TipstersPage() {
  const liveTipsters = await getTipsters('bayesian_rating', 50);
  const tipsters = liveTipsters.length > 0 ? liveTipsters : demoTipsters;
  const isLive = liveTipsters.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Tipster <span className="text-[#39FF14]">Rankings</span>
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Bayesian-rated — sample size matters. Lucky streaks filtered out.
          {!isLive && <span className="text-amber-400 ml-2">(Demo data — scraper not yet run)</span>}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {tipsters.map((tipster, i) => (
          <TipsterCard key={tipster.id} tipster={tipster} rank={i + 1} />
        ))}
      </div>

      {tipsters.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          No tipsters tracked yet. Trigger a scrape to start collecting data.
        </div>
      )}
    </div>
  );
}
