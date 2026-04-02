import type { Tip, Tipster, SignalBreakdown } from '@/types';

const WEIGHTS = {
  tipster: 0.30,
  form: 0.25,
  odds_value: 0.25,
  market: 0.20,
};

/**
 * Score tipster credibility (0-1).
 */
function tipsterSignal(tipster: Tipster): number {
  let score = 0;

  // Sample size factor (0-0.3)
  const sizeFactor = Math.min(tipster.total_tips / 100, 1) * 0.3;
  score += sizeFactor;

  // Win rate factor (0-0.25)
  const wrFactor = Math.min(tipster.win_rate / 100, 1) * 0.25;
  score += wrFactor;

  // ROI factor (0-0.25)
  const roiFactor = tipster.roi > 0 ? Math.min(tipster.roi / 30, 1) * 0.25 : 0;
  score += roiFactor;

  // Tier bonus (0-0.2)
  const tierBonus: Record<string, number> = { elite: 0.2, proven: 0.15, rising: 0.08, unranked: 0, avoid: -0.1 };
  score += tierBonus[tipster.tier] || 0;

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
    const homeStrength = tip.home_form.last_5.filter(r => r === 'W').length / 5;
    const awayStrength = tip.away_form.last_5.filter(r => r === 'W').length / 5;

    if (tipLower === '1' || tipLower === 'home') {
      // Tipping home win — home form matters positively
      score = 0.3 + homeStrength * 0.4 + (1 - awayStrength) * 0.3;
    } else if (tipLower === '2' || tipLower === 'away') {
      score = 0.3 + awayStrength * 0.4 + (1 - homeStrength) * 0.3;
    } else if (tipLower === 'x' || tipLower === 'draw') {
      // Draws more likely when teams are evenly matched
      const balance = 1 - Math.abs(homeStrength - awayStrength);
      score = 0.3 + balance * 0.5;
    }

    // H2H bonus
    if (tip.h2h_record && tip.h2h_record.matches >= 3) {
      const h2h = tip.h2h_record;
      const total = h2h.home_wins + h2h.draws + h2h.away_wins;
      if (tipLower === '1' && h2h.home_wins / total > 0.5) score += 0.1;
      if (tipLower === '2' && h2h.away_wins / total > 0.5) score += 0.1;
      if (tipLower === 'x' && h2h.draws / total > 0.3) score += 0.1;
    }
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Score odds value — is the bookmaker offering better odds than fair? (0-1)
 */
function oddsValueSignal(tip: Tip): number {
  if (!tip.fair_odds) return 0.5; // Neutral

  const bookmakerProb = 1 / tip.odds;
  const fairProb = 1 / tip.fair_odds;

  // Positive EV = bookmaker odds imply lower probability than our estimate
  // i.e., bookmaker thinks it's less likely → better payout for us
  const edge = fairProb - bookmakerProb;

  if (edge <= 0) return 0.3; // Negative EV — bad value
  if (edge > 0.15) return 0.95; // Massive edge
  if (edge > 0.10) return 0.85;
  if (edge > 0.05) return 0.70;
  return 0.5 + edge * 4; // Linear scaling for small edges
}

/**
 * Score market consensus — Polymarket + multi-tipster agreement (0-1).
 */
function marketSignal(tip: Tip, consensusCount: number): number {
  let score = 0.5;

  // Polymarket signal
  if (tip.polymarket_prob !== null && tip.polymarket_prob !== undefined) {
    // If Polymarket agrees with the tip direction
    const bookmakerProb = 1 / tip.odds;
    if (tip.polymarket_prob > bookmakerProb) {
      score += 0.2; // Market thinks it's more likely than bookmaker
    } else {
      score -= 0.1;
    }
  }

  // Consensus bonus — multiple good tipsters on same pick
  if (consensusCount >= 3) score += 0.2;
  else if (consensusCount >= 2) score += 0.1;

  return Math.max(0, Math.min(1, score));
}

/**
 * Main signal fusion — produces composite confidence for a pick.
 */
export function fuseSignals(tip: Tip, tipster: Tipster, consensusCount: number = 1): SignalBreakdown {
  const ts = tipsterSignal(tipster);
  const fs = formSignal(tip);
  const ov = oddsValueSignal(tip);
  const ms = marketSignal(tip, consensusCount);

  const composite =
    ts * WEIGHTS.tipster +
    fs * WEIGHTS.form +
    ov * WEIGHTS.odds_value +
    ms * WEIGHTS.market;

  return {
    tipster_signal: Math.round(ts * 100) / 100,
    form_signal: Math.round(fs * 100) / 100,
    odds_value_signal: Math.round(ov * 100) / 100,
    market_signal: Math.round(ms * 100) / 100,
    composite: Math.round(composite * 100) / 100,
  };
}

/**
 * Generate human-readable reasoning for a curated pick.
 */
export function generateReasoning(signals: SignalBreakdown, tipster: Tipster, tip: Tip): string {
  const parts: string[] = [];

  if (signals.tipster_signal >= 0.7) {
    parts.push(`${tipster.username} is ${tipster.tier}-tier (${tipster.win_rate.toFixed(0)}% win rate, ${tipster.total_tips} tips, ${tipster.roi.toFixed(1)}% ROI)`);
  } else if (signals.tipster_signal >= 0.4) {
    parts.push(`${tipster.username} shows decent form (${tipster.win_rate.toFixed(0)}% win rate over ${tipster.total_tips} tips)`);
  }

  if (signals.form_signal >= 0.7 && tip.home_form) {
    parts.push('Team form strongly supports this pick');
  }

  if (signals.odds_value_signal >= 0.7) {
    parts.push(`Good value — odds of ${tip.odds} appear higher than fair probability`);
  } else if (signals.odds_value_signal < 0.4) {
    parts.push('⚠️ Limited value in current odds');
  }

  if (signals.market_signal >= 0.7) {
    parts.push('Market consensus supports this outcome');
  }

  return parts.join('. ') + '.';
}
