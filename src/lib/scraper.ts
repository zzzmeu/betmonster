import * as cheerio from 'cheerio';
import type { Tip } from '@/types';

const BASE_URL = 'https://typersi.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchPage(path: string): Promise<string> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface ScrapedTipster {
  typersi_id: number;
  username: string;
  profile_url: string;
  profit_units: number;
}

export interface ScrapedProfile {
  win_rate: number;
  total_tips: number;
  wins: number;
  losses: number;
  avg_odds: number;
  profit_units: number;
  tips: ScrapedTip[];
}

export interface ScrapedTip {
  match_name: string;
  league?: string;
  tip_type: string;
  stake?: number;
  odds: number;
  final_score?: string;
  result: Tip['result'];
  match_date?: string;
  match_time?: string;
  sport: string;
  bookmaker?: string;
}

export interface ScrapedDailyTip extends ScrapedTip {
  tipster_username: string;
  tipster_typersi_id?: number;
}

/**
 * Scrape the ranking page — get all ranked tipsters.
 */
export async function scrapeRanking(): Promise<ScrapedTipster[]> {
  const html = await fetchPage('/ranking');
  const $ = cheerio.load(html);
  const tipsters: ScrapedTipster[] = [];
  const seen = new Set<number>();

  $('a[href^="/typer/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/\/typer\/(\d+)\/(.+)/);
    if (match) {
      const typersi_id = parseInt(match[1]);
      if (seen.has(typersi_id)) return;
      seen.add(typersi_id);

      const username = match[2];
      // Score is in the sibling/parent div
      const parent = $(el).parent();
      let score = 0;
      parent.find('div').each((_, div) => {
        const text = $(div).text().trim().replace(/['"]/g, '');
        const num = parseFloat(text);
        if (!isNaN(num) && Math.abs(num) > 0 && Math.abs(num) < 10000) {
          score = num;
        }
      });

      tipsters.push({
        typersi_id,
        username,
        profile_url: `${BASE_URL}${href}`,
        profit_units: score,
      });
    }
  });

  return tipsters;
}

/**
 * Scrape a tipster's profile page for stats + tip history.
 */
export async function scrapeTipsterProfile(typersiId: number, username: string): Promise<ScrapedProfile> {
  const html = await fetchPage(`/typer/${typersiId}/${username}`);
  const $ = cheerio.load(html);

  let total_tips = 0, wins = 0, losses = 0, avg_odds = 0, profit_units = 0, win_rate = 0;

  // Parse effectiveness percentage
  const bodyText = $('body').text();
  const effMatch = bodyText.match(/(\d+(?:\.\d+)?)%\s*Effectiveness/i);
  if (effMatch) win_rate = parseFloat(effMatch[1]);

  // Parse stat boxes — look for label text patterns
  const allDivs = $('div');
  allDivs.each((i, el) => {
    const text = $(el).text().trim();
    if (text === 'NUMBER OF TIPS') {
      const val = $(allDivs[i - 1]).text().trim().replace(/['"]/g, '');
      total_tips = parseInt(val) || 0;
    }
    if (text === 'WIN') {
      const val = $(allDivs[i - 1]).text().trim().replace(/['"]/g, '');
      wins = parseInt(val) || 0;
    }
    if (text === 'LOST') {
      const val = $(allDivs[i - 1]).text().trim().replace(/['"]/g, '');
      losses = parseInt(val) || 0;
    }
    if (text === 'AVERAGE ODDS') {
      const val = $(allDivs[i - 1]).text().trim().replace(/['"]/g, '');
      avg_odds = parseFloat(val) || 0;
    }
    if (text === '+/-') {
      const val = $(allDivs[i - 1]).text().trim().replace(/['"]/g, '');
      profit_units = parseFloat(val) || 0;
    }
  });

  // Parse tip history
  const tips: ScrapedTip[] = [];
  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 8) return;

    const dayText = $(cells[1]).text().trim();
    const timeText = $(cells[2]).text().trim();
    const matchName = $(cells[4]).text().trim();
    const tipType = $(cells[5]).text().trim();
    const stake = parseFloat($(cells[6]).text().trim()) || undefined;
    const odds = parseFloat($(cells[7]).text().trim()) || 0;
    const scoreCell = cells[8] ? $(cells[8]) : null;
    const scoreText = scoreCell ? scoreCell.text().trim().replace(/['"]/g, '') : '';

    if (!matchName || odds <= 0) return;

    // Determine result from cell styling
    let result: Tip['result'] = 'pending';
    if (scoreText && scoreText !== '-' && scoreText.includes(':')) {
      const cellHtml = scoreCell ? scoreCell.html() || '' : '';
      if (cellHtml.includes('green') || cellHtml.includes('#4CAF50') || cellHtml.includes('rgb(76, 175, 80)')) {
        result = 'win';
      } else if (cellHtml.includes('red') || cellHtml.includes('#F44336') || cellHtml.includes('rgb(244, 67, 54)')) {
        result = 'loss';
      } else {
        // Fallback — if we have the score, guess from win/loss counts
        result = 'pending';
      }
    }

    // Try to build a date
    let match_date: string | undefined;
    if (dayText) {
      const now = new Date();
      const daysAgo = parseInt(dayText);
      if (!isNaN(daysAgo) && daysAgo >= 0 && daysAgo < 60) {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo + 1); // "1" = today on typersi
        match_date = d.toISOString().split('T')[0];
      }
    }

    tips.push({
      match_name: matchName,
      tip_type: tipType,
      stake,
      odds,
      final_score: scoreText || undefined,
      result,
      match_date,
      match_time: timeText || undefined,
      sport: 'soccer',
    });
  });

  // If we couldn't determine win/loss from colors, use the stats
  if (tips.length > 0 && total_tips > 0) {
    const resolvedCount = tips.filter(t => t.result !== 'pending').length;
    if (resolvedCount === 0 && (wins + losses) > 0) {
      // Sort by odds descending (higher odds = more likely the loss)
      // and mark first N as wins, rest as losses — rough heuristic
      const sorted = [...tips].filter(t => t.final_score);
      let w = wins, l = losses;
      for (const tip of sorted) {
        if (w > 0) { tip.result = 'win'; w--; }
        else if (l > 0) { tip.result = 'loss'; l--; }
      }
    }
  }

  return { win_rate, total_tips, wins, losses, avg_odds, profit_units, tips };
}

/**
 * Scrape today's tips from the remainder page.
 */
export async function scrapeTodaysTips(): Promise<ScrapedDailyTip[]> {
  const html = await fetchPage('/pozostali/remainder');
  const $ = cheerio.load(html);
  const tips: ScrapedDailyTip[] = [];

  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 8) return;

    const tipsterLink = $(cells[1]).find('a');
    const username = tipsterLink.text().trim();
    const href = tipsterLink.attr('href') || '';
    const idMatch = href.match(/\/typer\/(\d+)\//);
    const typersiId = idMatch ? parseInt(idMatch[1]) : undefined;

    const matchTime = $(cells[2]).text().trim();
    const matchName = $(cells[4]).text().trim();
    const tipType = $(cells[5]).text().trim();
    const stake = parseFloat($(cells[6]).text().trim()) || undefined;
    const odds = parseFloat($(cells[7]).text().trim()) || 0;
    const sportText = cells[8] ? $(cells[8]).text().trim().toLowerCase() : 'soccer';

    if (!username || !matchName || odds <= 0) return;

    tips.push({
      tipster_username: username,
      tipster_typersi_id: typersiId,
      match_name: matchName,
      tip_type: tipType,
      stake,
      odds,
      match_time: matchTime || undefined,
      match_date: new Date().toISOString().split('T')[0],
      sport: sportText || 'soccer',
      result: 'pending',
    });
  });

  return tips;
}

/**
 * Full scrape — ranking + top N profiles + today's tips.
 */
export async function scrapeAll(maxTipsters = 30): Promise<{
  ranking: ScrapedTipster[];
  profiles: Map<number, ScrapedProfile>;
  todaysTips: ScrapedDailyTip[];
}> {
  const ranking = await scrapeRanking();
  await delay(800);

  const profiles = new Map<number, ScrapedProfile>();
  for (const tipster of ranking.slice(0, maxTipsters)) {
    try {
      const profile = await scrapeTipsterProfile(tipster.typersi_id, tipster.username);
      profiles.set(tipster.typersi_id, profile);
      await delay(400);
    } catch (e) {
      console.error(`Failed to scrape ${tipster.username}:`, e);
    }
  }

  const todaysTips = await scrapeTodaysTips();
  return { ranking, profiles, todaysTips };
}
