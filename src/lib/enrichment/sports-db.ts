/**
 * TheSportsDB integration — free, no API key needed.
 * Provides: team search, last results (form), next events, H2H via event search.
 */

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  league: string;
  sport: string;
}

interface MatchResult {
  date: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  league: string;
}

export interface TeamForm {
  team: string;
  last5: ('W' | 'D' | 'L')[];
  goalsScored: number;
  goalsConceded: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface H2HData {
  matches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  avgGoals: number;
  results: MatchResult[];
}

async function fetchJSON(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'BetMonster/1.0' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Search for a team by name.
 */
export async function searchTeam(name: string): Promise<TeamInfo | null> {
  const data = await fetchJSON(`${BASE}/searchteams.php?t=${encodeURIComponent(name)}`) as Record<string, unknown> | null;
  const teams = (data?.teams as Record<string, unknown>[]) || [];
  if (teams.length === 0) return null;
  
  const t = teams[0];
  return {
    id: t.idTeam as string,
    name: t.strTeam as string,
    shortName: (t.strTeamShort as string) || (t.strTeam as string),
    league: t.strLeague as string,
    sport: t.strSport as string,
  };
}

/**
 * Get last 5 results for a team — computes form (W/D/L).
 */
export async function getTeamForm(teamId: string, teamName: string): Promise<TeamForm | null> {
  const data = await fetchJSON(`${BASE}/eventslast.php?id=${teamId}`) as Record<string, unknown> | null;
  const results = (data?.results as Record<string, unknown>[]) || [];
  if (results.length === 0) return null;

  const last5: ('W' | 'D' | 'L')[] = [];
  let goalsScored = 0, goalsConceded = 0;
  let wins = 0, draws = 0, losses = 0;

  for (const e of results.slice(0, 5)) {
    const homeScore = parseInt(e.intHomeScore as string) || 0;
    const awayScore = parseInt(e.intAwayScore as string) || 0;
    const isHome = (e.strHomeTeam as string) === teamName;
    
    const teamGoals = isHome ? homeScore : awayScore;
    const oppGoals = isHome ? awayScore : homeScore;
    
    goalsScored += teamGoals;
    goalsConceded += oppGoals;
    
    if (teamGoals > oppGoals) { last5.push('W'); wins++; }
    else if (teamGoals === oppGoals) { last5.push('D'); draws++; }
    else { last5.push('L'); losses++; }
  }

  return { team: teamName, last5, goalsScored, goalsConceded, wins, draws, losses };
}

/**
 * Get H2H data for two teams.
 */
export async function getH2H(homeTeam: string, awayTeam: string): Promise<H2HData | null> {
  // TheSportsDB uses underscores in search
  const query = `${homeTeam}_vs_${awayTeam}`.replace(/ /g, '_');
  const data = await fetchJSON(`${BASE}/searchevents.php?e=${encodeURIComponent(query)}`) as Record<string, unknown> | null;
  const events = (data?.event as Record<string, unknown>[]) || [];
  
  if (events.length === 0) {
    // Try reverse order
    const query2 = `${awayTeam}_vs_${homeTeam}`.replace(/ /g, '_');
    const data2 = await fetchJSON(`${BASE}/searchevents.php?e=${encodeURIComponent(query2)}`) as Record<string, unknown> | null;
    const events2 = (data2?.event as Record<string, unknown>[]) || [];
    if (events2.length === 0) return null;
    return parseH2HEvents(events2, homeTeam, awayTeam);
  }
  
  return parseH2HEvents(events, homeTeam, awayTeam);
}

function parseH2HEvents(events: Record<string, unknown>[], homeTeam: string, awayTeam: string): H2HData {
  const results: MatchResult[] = [];
  let homeWins = 0, draws = 0, awayWins = 0, totalGoals = 0;

  for (const e of events.slice(0, 10)) {
    const hScore = parseInt(e.intHomeScore as string);
    const aScore = parseInt(e.intAwayScore as string);
    if (isNaN(hScore) || isNaN(aScore)) continue;

    results.push({
      date: e.dateEvent as string,
      home: e.strHomeTeam as string,
      away: e.strAwayTeam as string,
      homeScore: hScore,
      awayScore: aScore,
      league: e.strLeague as string,
    });

    totalGoals += hScore + aScore;

    // Determine who won relative to our home/away teams
    const eventHome = e.strHomeTeam as string;
    if (hScore > aScore) {
      if (eventHome.includes(homeTeam) || homeTeam.includes(eventHome)) homeWins++;
      else awayWins++;
    } else if (hScore === aScore) {
      draws++;
    } else {
      if (eventHome.includes(homeTeam) || homeTeam.includes(eventHome)) awayWins++;
      else homeWins++;
    }
  }

  return {
    matches: results.length,
    homeWins,
    draws,
    awayWins,
    avgGoals: results.length > 0 ? totalGoals / results.length : 0,
    results,
  };
}

/**
 * High-level: get form + H2H for a match.
 */
export async function enrichMatch(homeTeamName: string, awayTeamName: string): Promise<{
  homeForm: TeamForm | null;
  awayForm: TeamForm | null;
  h2h: H2HData | null;
}> {
  const [homeTeam, awayTeam] = await Promise.all([
    searchTeam(homeTeamName),
    searchTeam(awayTeamName),
  ]);

  const [homeForm, awayForm, h2h] = await Promise.all([
    homeTeam ? getTeamForm(homeTeam.id, homeTeam.name) : null,
    awayTeam ? getTeamForm(awayTeam.id, awayTeam.name) : null,
    getH2H(homeTeamName, awayTeamName),
  ]);

  return { homeForm, awayForm, h2h };
}
