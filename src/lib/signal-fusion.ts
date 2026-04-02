import type { Tip, Tipster, SignalBreakdown } from '@/types';

/**
 * WEIGHTS — Tipster credibility is king (60%).
 * Only picks from proven performers pass. Form and odds are validation layers.
 */
const WEIGHTS = {
  tipster: 0.60,   // Track record is the strongest predictor
  form: 0.25,      // Team form + H2H supports/contradicts the pick
  odds_value: 0.15, // Are we getting good odds relative to fair probability
};

/**
 * Score tipster credibility (0-1).
 * Only top tipsters score high. This is the main filter.
 */
function tipsterSignal(tipster: Tipster): number {
  let score = 0;

  // Sample size is critical — minimum 10 tips to be considered
  if (tipster.total_tips < 5) return 0.05; // Almost zero for tiny samples
  if (tipster.total_tips < 10) return 0.15;

  // Sample size factor (0-0.25) — scales up to 100 tips
  const sizeFactor = Math.min(tipster.total_tips / 100, 1) * 0.25;
  score += sizeFactor;

  // Win rate factor (0-0.30) — only meaningful with enough tips
  if (tipster.win_rate >= 70) score += 0.30;
  else if (tipster.win_rate >= 60) score += 0.22;
  else if (tipster.win_rate >= 55) score += 0.15;
  else if (tipster.win_rate >= 50) score += 0.08;
  // Below 50% gets nothing

  // ROI factor (0-0.20) — profitable tipsters
  if (tipster.roi > 20) score += 0.20;
  else if (tipster.roi > 10) score += 0.15;
  else if (tipster.roi > 5) score += 0.10;
  else if (tipster.roi > 0) score += 0.05;
  // Negative ROI gets nothing

  // Consistency bonus (0-0.10)
  if (tipster.consistency_score > 70) score += 0.10;
  else if (tipster.consistency_score > 50) score += 0.05;

  // Tier bonus (0-0.15)
  const tierBonus: Record<string, number> = { 
    elite: 0.15, 
    proven: 0.10, 
    rising: 0.05, 
    unranked: 0, 
    avoid: -0.15 
  };
  score += tierBonus[tipster.tier] || 0;

  // Bayesian rating bonus for high performers
  if (tipster.bayesian_rating > 5) score += 0.05;

  return Math.max(0, Math.min(1, score));
}

/**
 * Score based on team form data (0-1).
 */
function formSignal(tip: Tip): number {
  if (!tip.home_form && !tip.away_form) return 0.5; // Neutral when no data

  let score = 0.5;
  const tipLower = tip.tip_type.toLowerCase();

  if (tip.home_form && tip.away_form) {
    const homeWins = tip.home_form.last_5 ? tip.home_form.last_5.filter((r: string) => r === 'W').length : 0;
    const awayWins = tip.away_form.last_5 ? tip.away_form.last_5.filter((r: string) => r === 'W').length : 0;
    const homeStrength = homeWins / Math.max(tip.home_form.last_5?.length || 1, 1);
    const awayStrength = awayWins / Math.max(tip.away_form.last_5?.length || 1, 1);

    if (tipLower === '1' || tipLower === 'home') {
      score = 0.3 + homeStrength * 0.4 + (1 - awayStrength) * 0.3;
    } else if (tipLower === '2' || tipLower === 'away') {
      score = 0.3 + awayStrength * 0.4 + (1 - homeStrength) * 0.3;
    } else if (tipLower === 'x' || tipLower === 'draw') {
      const balance = 1 - Math.abs(homeStrength - awayStrength);
      score = 0.3 + balance * 0.5;
    } else if (tipLower.includes('over')) {
      // Over markets — both teams scoring = good
      const avgGoals = ((tip.home_form.goals_scored || 0) + (tip.away_form.goals_scored || 0)) / 2;
      score = 0.3 + Math.min(avgGoals / 4, 1) * 0.5;
    } else if (tipLower.includes('under')) {
      const avgGoals = ((tip.home_form.goals_scored || 0) + (tip.away_form.goals_scored || 0)) / 2;
      score = 0.3 + Math.max(0, 1 - avgGoals / 4) * 0.5;
    }

    // H2H bonus
    if (tip.h2h_record && tip.h2h_record.matches >= 3) {
      const h2h = tip.h2h_record;
      const total = h2h.home_wins + h2h.draws + h2h.away_wins;
      if (total > 0) {
        if (tipLower === '1' && h2h.home_wins / total > 0.5) score += 0.1;
        if (tipLower === '2' && h2h.away_wins / total > 0.5) score += 0.1;
        if (tipLower === 'x' && h2h.draws / total > 0.3) score += 0.1;
      }
    }
  } else if (tip.home_form || tip.away_form) {
    // Only one team's form available — partial signal
    const form = tip.home_form || tip.away_form;
    if (form && form.last_5) {
      const wins = form.last_5.filter((r: string) => r === 'W').length;
      const strength = wins / form.last_5.length;
      score = 0.4 + strength * 0.3;
    }
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Score odds value — is the bookmaker offering better odds than fair? (0-1)
 */
function oddsValueSignal(tip: Tip): number {
  if (!tip.fair_odds) return 0.5; // Neutral when no odds data

  const bookmakerProb = 1 / tip.odds;
  const fairProb = 1 / tip.fair_odds;

  const edge = fairProb - bookmakerProb;

  if (edge <= -0.05) return 0.15; // Significant negative EV — bad
  if (edge <= 0) return 0.35; // Slightly negative EV
  if (edge > 0.15) return 0.95; // Massive edge
  if (edge > 0.10) return 0.85;
  if (edge > 0.05) return 0.70;
  return 0.5 + edge * 4;
}

/**
 * Main signal fusion — produces composite confidence.
 * Tipster signal is 60%. Only top tipsters' picks surface.
 */
export function fuseSignals(tip: Tip, tipster: Tipster, consensusCount: number = 1): SignalBreakdown {
  const ts = tipsterSignal(tipster);
  const fs = formSignal(tip);
  const ov = oddsValueSignal(tip);

  // Consensus multiplier — multiple top tipsters on same match
  let consensusBonus = 0;
  if (consensusCount >= 3) consensusBonus = 0.08;
  else if (consensusCount >= 2) consensusBonus = 0.04;

  const composite = Math.min(1,
    ts * WEIGHTS.tipster +
    fs * WEIGHTS.form +
    ov * WEIGHTS.odds_value +
    consensusBonus
  );

  return {
    tipster_signal: Math.round(ts * 100) / 100,
    form_signal: Math.round(fs * 100) / 100,
    odds_value_signal: Math.round(ov * 100) / 100,
    market_signal: consensusCount, // Repurpose: consensus count instead of polymarket
    composite: Math.round(composite * 100) / 100,
  };
}

/**
 * Generate human-readable reasoning for a curated pick.
 */
export function generateReasoning(signals: SignalBreakdown, tipster: Tipster, tip: Tip): string {
  const parts: string[] = [];

  // Tipster credibility
  if (signals.tipster_signal >= 0.7) {
    parts.push(`${tipster.username} is ${tipster.tier}-tier (${tipster.win_rate.toFixed(0)}% win rate across ${tipster.total_tips} tips, ${tipster.roi.toFixed(1)}% ROI)`);
  } else if (signals.tipster_signal >= 0.4) {
    parts.push(`${tipster.username}: ${tipster.win_rate.toFixed(0)}% win rate over ${tipster.total_tips} tips`);
  } else {
    parts.push(`${tipster.username}: limited track record (${tipster.total_tips} tips)`);
  }

  // Form analysis
  if (signals.form_signal >= 0.7) {
    if (tip.home_form?.last_5 && tip.away_form?.last_5) {
      const hForm = tip.home_form.last_5.join('');
      const aForm = tip.away_form.last_5.join('');
      parts.push(`Form supports pick (Home: ${hForm}, Away: ${aForm})`);
    } else {
      parts.push('Team form strongly supports this pick');
    }
  } else if (signals.form_signal < 0.4) {
    parts.push('⚠️ Team form does not support this pick');
  }

  // H2H
  if (tip.h2h_record && tip.h2h_record.matches >= 3) {
    const h = tip.h2h_record;
    parts.push(`H2H: ${h.home_wins}W ${h.draws}D ${h.away_wins}L in ${h.matches} meetings (${h.avg_goals.toFixed(1)} avg goals)`);
  }

  // Odds value
  if (signals.odds_value_signal >= 0.7) {
    parts.push(`Value: odds of ${tip.odds} exceed fair probability`);
  } else if (signals.odds_value_signal < 0.35) {
    parts.push('⚠️ Poor value at current odds');
  }

  // Consensus
  if (signals.market_signal >= 3) {
    parts.push(`🔥 ${signals.market_signal} top tipsters agree on this pick`);
  } else if (signals.market_signal >= 2) {
    parts.push(`${signals.market_signal} tipsters backing this pick`);
  }

  return parts.join('. ') + '.';
}
