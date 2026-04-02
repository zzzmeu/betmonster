import type { Tipster, Tip } from '@/types';

const BAYESIAN_PRIOR_WEIGHT = 10;
const BAYESIAN_PRIOR_MEAN = 0;

/**
 * Bayesian rating — adjusts for sample size.
 * 2 tips at 100% ≠ 200 tips at 72%.
 */
export function calculateBayesianRating(totalTips: number, profitUnits: number): number {
  return (BAYESIAN_PRIOR_WEIGHT * BAYESIAN_PRIOR_MEAN + profitUnits) / (BAYESIAN_PRIOR_WEIGHT + totalTips);
}

/**
 * ROI = total profit / total staked * 100
 */
export function calculateROI(tips: Pick<Tip, 'stake' | 'odds' | 'result'>[]): number {
  let totalStaked = 0;
  let totalReturn = 0;

  for (const tip of tips) {
    const stake = tip.stake || 10;
    totalStaked += stake;
    if (tip.result === 'win') {
      totalReturn += stake * tip.odds;
    }
  }

  if (totalStaked === 0) return 0;
  return ((totalReturn - totalStaked) / totalStaked) * 100;
}

/**
 * Consistency score: inverse of standard deviation of rolling profit windows.
 * Lower std dev = higher consistency = higher score (0-100).
 */
export function calculateConsistency(tips: Pick<Tip, 'stake' | 'odds' | 'result'>[]): number {
  if (tips.length < 5) return 0;

  const windowSize = Math.min(10, Math.floor(tips.length / 2));
  const profits: number[] = [];

  for (let i = 0; i <= tips.length - windowSize; i++) {
    const window = tips.slice(i, i + windowSize);
    let windowProfit = 0;
    for (const tip of window) {
      const stake = tip.stake || 10;
      if (tip.result === 'win') {
        windowProfit += stake * (tip.odds - 1);
      } else if (tip.result === 'loss') {
        windowProfit -= stake;
      }
    }
    profits.push(windowProfit);
  }

  const mean = profits.reduce((a, b) => a + b, 0) / profits.length;
  const variance = profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / profits.length;
  const stdDev = Math.sqrt(variance);

  // Normalize: lower std dev = higher score
  // Typical std dev range 0-50, map to 100-0
  return Math.max(0, Math.min(100, 100 - stdDev * 2));
}

/**
 * Determine tipster tier based on multiple factors.
 */
export function calculateTier(tipster: Pick<Tipster, 'total_tips' | 'bayesian_rating' | 'roi' | 'win_rate'>): Tipster['tier'] {
  const { total_tips, bayesian_rating, roi, win_rate } = tipster;

  if (total_tips < 10) return 'unranked';
  if (roi < -20 && total_tips >= 20) return 'avoid';
  if (bayesian_rating > 3 && roi > 10 && win_rate > 55 && total_tips >= 30) return 'elite';
  if (bayesian_rating > 1.5 && roi > 5 && total_tips >= 20) return 'proven';
  if (bayesian_rating > 0 && total_tips >= 10) return 'rising';
  return 'unranked';
}

/**
 * Calculate specialization — win rate breakdown by sport/league.
 */
export function calculateSpecialization(tips: Pick<Tip, 'sport' | 'league' | 'result'>[]): Record<string, { wins: number; losses: number; win_rate: number }> {
  const specs: Record<string, { wins: number; losses: number }> = {};

  for (const tip of tips) {
    const key = tip.league || tip.sport || 'unknown';
    if (!specs[key]) specs[key] = { wins: 0, losses: 0 };
    if (tip.result === 'win') specs[key].wins++;
    if (tip.result === 'loss') specs[key].losses++;
  }

  const result: Record<string, { wins: number; losses: number; win_rate: number }> = {};
  for (const [key, val] of Object.entries(specs)) {
    const total = val.wins + val.losses;
    if (total >= 3) {
      result[key] = { ...val, win_rate: (val.wins / total) * 100 };
    }
  }

  return result;
}

/**
 * Full tipster scoring pipeline.
 */
export function scoreTipster(tips: Tip[]): {
  bayesian_rating: number;
  roi: number;
  consistency_score: number;
  tier: Tipster['tier'];
  specialization: Record<string, { wins: number; losses: number; win_rate: number }>;
  win_rate: number;
  profit_units: number;
} {
  const settled = tips.filter(t => t.result === 'win' || t.result === 'loss');
  const wins = settled.filter(t => t.result === 'win').length;
  const losses = settled.filter(t => t.result === 'loss').length;
  const total = wins + losses;
  const win_rate = total > 0 ? (wins / total) * 100 : 0;

  let profit_units = 0;
  for (const tip of settled) {
    const stake = tip.stake || 10;
    if (tip.result === 'win') {
      profit_units += stake * (tip.odds - 1);
    } else {
      profit_units -= stake;
    }
  }

  const bayesian_rating = calculateBayesianRating(total, profit_units);
  const roi = calculateROI(settled);
  const consistency_score = calculateConsistency(settled);
  const specialization = calculateSpecialization(settled);
  const tier = calculateTier({ total_tips: total, bayesian_rating, roi, win_rate });

  return { bayesian_rating, roi, consistency_score, tier, specialization, win_rate, profit_units };
}
