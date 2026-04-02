/**
 * Polymarket integration — prediction market probabilities.
 * Uses the CLOB API for market prices.
 * 
 * Note: Polymarket primarily covers major events (Champions League finals, 
 * World Cup, etc.) — not every league match. This is a supplementary signal.
 */

const CLOB_BASE = 'https://clob.polymarket.com';

export interface PolymarketEvent {
  id: string;
  title: string;
  markets: PolymarketMarket[];
}

export interface PolymarketMarket {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: number[];
  active: boolean;
  volume: number;
}

/**
 * Search Polymarket for sports-related markets.
 * Returns markets that might match our tips.
 */
export async function searchSportsMarkets(query: string): Promise<PolymarketMarket[]> {
  try {
    // Try the CLOB API
    const res = await fetch(`${CLOB_BASE}/markets?next_cursor=MA==`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      console.log('[polymarket] API unavailable:', res.status);
      return [];
    }
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    // Filter for sports-related markets matching query
    const q = query.toLowerCase();
    return data
      .filter((m: Record<string, unknown>) => {
        const question = ((m.question as string) || '').toLowerCase();
        const desc = ((m.description as string) || '').toLowerCase();
        return question.includes(q) || desc.includes(q) || 
               question.includes('soccer') || question.includes('football') ||
               question.includes('premier league') || question.includes('champions league');
      })
      .map(parseMarket)
      .filter((m: PolymarketMarket) => m.active);
  } catch (e) {
    console.log('[polymarket] Error fetching markets:', e);
    return [];
  }
}

/**
 * Get probability for a specific match outcome from Polymarket.
 * Returns null if no matching market found.
 */
export async function getMatchProbability(homeTeam: string, awayTeam: string): Promise<{
  homeWinProb: number | null;
  drawProb: number | null;
  awayWinProb: number | null;
  marketUrl: string | null;
  volume: number;
} | null> {
  try {
    // Search for the match
    const markets = await searchSportsMarkets(homeTeam);
    
    if (markets.length === 0) {
      // Try away team
      const markets2 = await searchSportsMarkets(awayTeam);
      if (markets2.length === 0) return null;
      return extractProbabilities(markets2, homeTeam, awayTeam);
    }
    
    return extractProbabilities(markets, homeTeam, awayTeam);
  } catch {
    return null;
  }
}

function extractProbabilities(markets: PolymarketMarket[], homeTeam: string, awayTeam: string) {
  // Find the most relevant market
  const h = homeTeam.toLowerCase();
  const a = awayTeam.toLowerCase();
  
  const match = markets.find(m => {
    const q = m.question.toLowerCase();
    return (q.includes(h) || q.includes(a));
  });
  
  if (!match) return null;
  
  let homeWinProb: number | null = null;
  let drawProb: number | null = null;
  let awayWinProb: number | null = null;
  
  for (let i = 0; i < match.outcomes.length; i++) {
    const outcome = match.outcomes[i].toLowerCase();
    const price = match.outcomePrices[i];
    
    if (outcome.includes(h) || outcome.includes('home') || outcome.includes('yes')) {
      homeWinProb = price;
    } else if (outcome.includes(a) || outcome.includes('away') || outcome.includes('no')) {
      awayWinProb = price;
    } else if (outcome.includes('draw')) {
      drawProb = price;
    }
  }
  
  return {
    homeWinProb,
    drawProb,
    awayWinProb,
    marketUrl: `https://polymarket.com/event/${match.id}`,
    volume: match.volume,
  };
}

function parseMarket(raw: Record<string, unknown>): PolymarketMarket {
  return {
    id: (raw.condition_id as string) || (raw.id as string) || '',
    question: (raw.question as string) || '',
    outcomes: Array.isArray(raw.outcomes) ? raw.outcomes as string[] : [],
    outcomePrices: Array.isArray(raw.outcomePrices) 
      ? (raw.outcomePrices as string[]).map(Number) 
      : [],
    active: (raw.active as boolean) !== false,
    volume: parseFloat(raw.volume as string) || 0,
  };
}
