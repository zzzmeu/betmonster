/**
 * Enrichment orchestrator — runs all data sources for pending tips.
 */

import { enrichMatch, type TeamForm, type H2HData } from './sports-db';
import { getAllSoccerOdds, findMatchOdds, type MatchOdds } from './odds-api';
import { getMatchProbability } from './polymarket';
import { createClient } from '@supabase/supabase-js';

export interface EnrichmentResult {
  tipId: number;
  homeForm: TeamForm | null;
  awayForm: TeamForm | null;
  h2h: H2HData | null;
  fairOdds: number | null;
  oddsMovement: { direction: string; sharpSignal: string | null } | null;
  polymarketProb: number | null;
  sources: string[];
}

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key);
}

/**
 * Parse "Team A - Team B" match name into home/away.
 */
function parseMatchName(matchName: string): { home: string; away: string } | null {
  // Try common separators
  for (const sep of [' - ', ' vs ', ' v ']) {
    if (matchName.includes(sep)) {
      const [home, away] = matchName.split(sep).map(s => s.trim());
      if (home && away) return { home, away };
    }
  }
  return null;
}

/**
 * Enrich a single tip with all available data sources.
 */
export async function enrichTip(
  tipId: number,
  matchName: string,
  tipType: string,
  odds: number,
  allOdds: MatchOdds[]
): Promise<EnrichmentResult> {
  const sources: string[] = [];
  const teams = parseMatchName(matchName);
  
  if (!teams) {
    return { tipId, homeForm: null, awayForm: null, h2h: null, fairOdds: null, oddsMovement: null, polymarketProb: null, sources: [] };
  }

  // 1. TheSportsDB — team form + H2H
  let homeForm: TeamForm | null = null;
  let awayForm: TeamForm | null = null;
  let h2h: H2HData | null = null;
  
  try {
    const matchData = await enrichMatch(teams.home, teams.away);
    homeForm = matchData.homeForm;
    awayForm = matchData.awayForm;
    h2h = matchData.h2h;
    if (homeForm || awayForm) sources.push('thesportsdb:form');
    if (h2h && h2h.matches > 0) sources.push('thesportsdb:h2h');
  } catch (e) {
    console.error(`[enrich] TheSportsDB error for ${matchName}:`, e);
  }

  // 2. The Odds API — fair odds + line movement
  let fairOdds: number | null = null;
  let oddsMovement: { direction: string; sharpSignal: string | null } | null = null;

  const matchOdds = findMatchOdds(allOdds, teams.home, teams.away);
  if (matchOdds && matchOdds.fairOdds) {
    const tipLower = tipType.toLowerCase();
    if (tipLower === '1' || tipLower === 'home') {
      fairOdds = matchOdds.fairOdds.home;
    } else if (tipLower === '2' || tipLower === 'away') {
      fairOdds = matchOdds.fairOdds.away;
    } else if (tipLower === 'x' || tipLower === 'draw') {
      fairOdds = matchOdds.fairOdds.draw;
    }
    
    oddsMovement = {
      direction: matchOdds.sharpMovement || 'unknown',
      sharpSignal: matchOdds.sharpMovement,
    };
    sources.push('odds-api');
  }

  // 3. Polymarket — prediction market probability
  let polymarketProb: number | null = null;
  try {
    const polyData = await getMatchProbability(teams.home, teams.away);
    if (polyData) {
      const tipLower = tipType.toLowerCase();
      if (tipLower === '1' || tipLower === 'home') {
        polymarketProb = polyData.homeWinProb;
      } else if (tipLower === '2' || tipLower === 'away') {
        polymarketProb = polyData.awayWinProb;
      } else if (tipLower === 'x' || tipLower === 'draw') {
        polymarketProb = polyData.drawProb;
      }
      if (polymarketProb !== null) sources.push('polymarket');
    }
  } catch (e) {
    console.log('[enrich] Polymarket unavailable:', e);
  }

  return { tipId, homeForm, awayForm, h2h, fairOdds, oddsMovement, polymarketProb, sources };
}

/**
 * Enrich all pending tips for today.
 */
export async function enrichAllPendingTips(): Promise<{ enriched: number; sources: Record<string, number> }> {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  // Get today's pending tips
  const { data: tips } = await db
    .from('tips')
    .select('id, match_name, tip_type, odds')
    .eq('match_date', today)
    .eq('result', 'pending');

  if (!tips || tips.length === 0) {
    return { enriched: 0, sources: {} };
  }

  // Fetch odds data once for all matches (saves API credits)
  let allOdds: MatchOdds[] = [];
  try {
    allOdds = await getAllSoccerOdds();
  } catch (e) {
    console.log('[enrich] Odds API unavailable:', e);
  }

  const sourceCounts: Record<string, number> = {};
  let enrichedCount = 0;

  for (const tip of tips) {
    const result = await enrichTip(tip.id, tip.match_name, tip.tip_type, tip.odds, allOdds);
    
    // Track sources
    for (const s of result.sources) {
      sourceCounts[s] = (sourceCounts[s] || 0) + 1;
    }

    // Update tip with enrichment data
    const update: Record<string, unknown> = {};
    
    if (result.homeForm) {
      update.home_form = {
        last_5: result.homeForm.last5,
        goals_scored: result.homeForm.goalsScored,
        goals_conceded: result.homeForm.goalsConceded,
      };
    }
    if (result.awayForm) {
      update.away_form = {
        last_5: result.awayForm.last5,
        goals_scored: result.awayForm.goalsScored,
        goals_conceded: result.awayForm.goalsConceded,
      };
    }
    if (result.h2h) {
      update.h2h_record = {
        matches: result.h2h.matches,
        home_wins: result.h2h.homeWins,
        draws: result.h2h.draws,
        away_wins: result.h2h.awayWins,
        avg_goals: result.h2h.avgGoals,
      };
    }
    if (result.fairOdds) update.fair_odds = result.fairOdds;
    if (result.oddsMovement) update.odds_movement = result.oddsMovement;
    if (result.polymarketProb !== null) update.polymarket_prob = result.polymarketProb;

    if (Object.keys(update).length > 0) {
      await db.from('tips').update(update).eq('id', tip.id);
      enrichedCount++;
    }

    // Rate limit between tips
    await new Promise(r => setTimeout(r, 300));
  }

  return { enriched: enrichedCount, sources: sourceCounts };
}
