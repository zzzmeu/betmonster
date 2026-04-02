/**
 * The Odds API integration — free tier: 500 credits/month.
 * Provides: multi-bookmaker odds for h2h, spreads, totals.
 * 
 * Sign up at: https://the-odds-api.com/#get-access
 * Set ODDS_API_KEY in env vars.
 */

const BASE = 'https://api.the-odds-api.com/v4';

export interface OddsOutcome {
  name: string;
  price: number; // Decimal odds
}

export interface BookmakerOdds {
  key: string;
  title: string;
  lastUpdate: string;
  markets: {
    key: string;
    outcomes: OddsOutcome[];
  }[];
}

export interface MatchOdds {
  id: string;
  sportKey: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers: BookmakerOdds[];
  // Computed
  fairOdds: { home: number; draw: number; away: number } | null;
  consensus: { home: number; draw: number; away: number } | null;
  sharpMovement: 'home' | 'away' | 'draw' | 'stable' | null;
}

function getApiKey(): string | null {
  return process.env.ODDS_API_KEY || null;
}

/**
 * Get available sports.
 */
export async function getSports(): Promise<{ key: string; title: string; active: boolean }[]> {
  const key = getApiKey();
  if (!key) return [];
  
  try {
    const res = await fetch(`${BASE}/sports/?apiKey=${key}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Get odds for a specific sport (e.g., 'soccer_epl', 'soccer_germany_bundesliga').
 * Each call costs 1 credit per region per market.
 */
export async function getOdds(sportKey: string, regions = 'eu', markets = 'h2h'): Promise<MatchOdds[]> {
  const key = getApiKey();
  if (!key) return [];
  
  try {
    const res = await fetch(
      `${BASE}/sports/${sportKey}/odds/?apiKey=${key}&regions=${regions}&markets=${markets}&oddsFormat=decimal`,
      { next: { revalidate: 1800 } } // Cache 30 min
    );
    if (!res.ok) {
      console.error(`[odds-api] Failed for ${sportKey}: ${res.status}`);
      return [];
    }
    
    const data = await res.json() as Record<string, unknown>[];
    return data.map(parseMatchOdds);
  } catch (e) {
    console.error('[odds-api] Error:', e);
    return [];
  }
}

/**
 * Get odds for multiple soccer leagues efficiently (1 credit each).
 */
export async function getAllSoccerOdds(): Promise<MatchOdds[]> {
  const leagues = [
    'soccer_epl',
    'soccer_germany_bundesliga', 
    'soccer_spain_la_liga',
    'soccer_italy_serie_a',
    'soccer_france_ligue_one',
    'soccer_uefa_champs_league',
    'soccer_uefa_europa_league',
  ];
  
  const results: MatchOdds[] = [];
  for (const league of leagues) {
    const odds = await getOdds(league);
    results.push(...odds);
  }
  return results;
}

function parseMatchOdds(raw: Record<string, unknown>): MatchOdds {
  const bookmakers: BookmakerOdds[] = ((raw.bookmakers as Record<string, unknown>[]) || []).map(b => ({
    key: b.key as string,
    title: b.title as string,
    lastUpdate: b.last_update as string,
    markets: ((b.markets as Record<string, unknown>[]) || []).map(m => ({
      key: m.key as string,
      outcomes: ((m.outcomes as Record<string, unknown>[]) || []).map(o => ({
        name: o.name as string,
        price: o.price as number,
      })),
    })),
  }));

  // Compute fair odds (average across bookmakers, remove margin)
  const fairOdds = computeFairOdds(bookmakers);
  const consensus = computeConsensus(bookmakers);
  const sharpMovement = detectSharpMovement(bookmakers);

  return {
    id: raw.id as string,
    sportKey: raw.sport_key as string,
    homeTeam: raw.home_team as string,
    awayTeam: raw.away_team as string,
    commenceTime: raw.commence_time as string,
    bookmakers,
    fairOdds,
    consensus,
    sharpMovement,
  };
}

/**
 * Compute fair odds by averaging across bookmakers and removing margin.
 */
function computeFairOdds(bookmakers: BookmakerOdds[]): { home: number; draw: number; away: number } | null {
  if (bookmakers.length === 0) return null;

  let homeSum = 0, drawSum = 0, awaySum = 0;
  let count = 0;

  for (const bm of bookmakers) {
    const h2h = bm.markets.find(m => m.key === 'h2h');
    if (!h2h || h2h.outcomes.length < 2) continue;

    for (const o of h2h.outcomes) {
      const prob = 1 / o.price;
      if (o.name === bookmakers[0].markets[0]?.outcomes[0]?.name) homeSum += prob;
      else if (o.name === 'Draw') drawSum += prob;
      else awaySum += prob;
    }
    count++;
  }

  if (count === 0) return null;

  // Average implied probabilities
  const homeProb = homeSum / count;
  const drawProb = drawSum / count;
  const awayProb = awaySum / count;
  
  // Remove overround (normalize to 100%)
  const total = homeProb + drawProb + awayProb;
  if (total === 0) return null;

  return {
    home: Math.round((1 / (homeProb / total)) * 100) / 100,
    draw: drawProb > 0 ? Math.round((1 / (drawProb / total)) * 100) / 100 : 0,
    away: Math.round((1 / (awayProb / total)) * 100) / 100,
  };
}

/**
 * Compute consensus probability (what the market thinks).
 */
function computeConsensus(bookmakers: BookmakerOdds[]): { home: number; draw: number; away: number } | null {
  const fair = computeFairOdds(bookmakers);
  if (!fair) return null;

  return {
    home: Math.round((1 / fair.home) * 10000) / 100,
    draw: fair.draw > 0 ? Math.round((1 / fair.draw) * 10000) / 100 : 0,
    away: Math.round((1 / fair.away) * 10000) / 100,
  };
}

/**
 * Detect sharp line movement — if Pinnacle/Betfair differ significantly from average.
 */
function detectSharpMovement(bookmakers: BookmakerOdds[]): 'home' | 'away' | 'draw' | 'stable' | null {
  const sharp = bookmakers.find(b => b.key === 'pinnacle' || b.key === 'betfair');
  if (!sharp) return null;

  const sharpH2H = sharp.markets.find(m => m.key === 'h2h');
  if (!sharpH2H) return null;

  const fair = computeFairOdds(bookmakers);
  if (!fair) return null;

  // Compare sharp book odds to consensus
  for (const o of sharpH2H.outcomes) {
    const sharpProb = 1 / o.price;
    if (o.name === 'Draw') continue;
    
    const fairProb = o.name === bookmakers[0]?.markets[0]?.outcomes[0]?.name 
      ? 1 / fair.home 
      : 1 / fair.away;
    
    // If sharp book thinks it's >5% more likely than average — that's movement
    if (sharpProb - fairProb > 0.05) {
      return o.name === bookmakers[0]?.markets[0]?.outcomes[0]?.name ? 'home' : 'away';
    }
  }

  return 'stable';
}

/**
 * Find odds for a specific match by team names (fuzzy match).
 */
export function findMatchOdds(allOdds: MatchOdds[], homeTeam: string, awayTeam: string): MatchOdds | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const h = normalize(homeTeam);
  const a = normalize(awayTeam);

  return allOdds.find(o => {
    const oh = normalize(o.homeTeam);
    const oa = normalize(o.awayTeam);
    return (oh.includes(h) || h.includes(oh)) && (oa.includes(a) || a.includes(oa));
  }) || null;
}
