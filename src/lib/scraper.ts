import * as cheerio from 'cheerio';
import type { Tipster, Tip } from '@/types';

const BASE_URL = 'https://typersi.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchPage(path: string): Promise<string> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scrape the ranking page — get all ranked tipsters.
 */
export async function scrapeRanking(): Promise<Partial<Tipster>[]> {
  const html = await fetchPage('/ranking');
  const $ = cheerio.load(html);
  const tipsters: Partial<Tipster>[] = [];

  // Find tipster links in ranking section
  $('a[href^="/typer/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/\/typer\/(\d+)\/(.+)/);
    if (match) {
      const typersi_id = parseInt(match[1]);
      const username = match[2];
      // Avoid duplicates
      if (!tipsters.find(t => t.typersi_id === typersi_id)) {
        const scoreEl = $(el).parent().find('div').last();
        const score = parseFloat(scoreEl.text().replace(/['"]/g, '')) || 0;
        tipsters.push({
          typersi_id,
          username,
          profile_url: `${BASE_URL}${href}`,
          profit_units: score,
        });
      }
    }
  });

  return tipsters;
}

/**
 * Scrape a tipster's profile — get their stats and tip history.
 */
export async function scrapeTipsterProfile(typersiId: number, username: string): Promise<{
  stats: {
    win_rate: number;
    total_tips: number;
    wins: number;
    losses: number;
    avg_odds: number;
    profit_units: number;
  };
  tips: Partial<Tip>[];
}> {
  const html = await fetchPage(`/typer/${typersiId}/${username}`);
  const $ = cheerio.load(html);

  // Parse stats
  const statsText = $('body').text();
  const effectivenessMatch = statsText.match(/(\d+(?:\.\d+)?)%/);
  const win_rate = effectivenessMatch ? parseFloat(effectivenessMatch[1]) : 0;

  let total_tips = 0, wins = 0, losses = 0, avg_odds = 0, profit_units = 0;

  // Parse stat boxes
  $('div').each((_, el) => {
    const text = $(el).text().trim();
    const prev = $(el).prev().text().trim();
    if (text === 'NUMBER OF TIPS') total_tips = parseInt(prev) || 0;
    if (text === 'WIN') wins = parseInt(prev) || 0;
    if (text === 'LOST') losses = parseInt(prev) || 0;
    if (text === 'AVERAGE ODDS') avg_odds = parseFloat(prev) || 0;
    if (text === '+/-') profit_units = parseFloat(prev) || 0;
  });

  // Parse tip history table
  const tips: Partial<Tip>[] = [];
  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 8) {
      const matchName = $(cells[4]).text().trim();
      const tipType = $(cells[5]).text().trim();
      const stake = parseFloat($(cells[6]).text().trim()) || undefined;
      const odds = parseFloat($(cells[7]).text().trim()) || 0;
      const scoreText = $(cells[8]).text().trim();

      if (matchName && odds > 0) {
        // Determine result from score presence and styling
        let result: Tip['result'] = 'pending';
        if (scoreText && scoreText !== '-') {
          // Check if the row has win/loss styling
          const rowClass = $(row).attr('class') || '';
          const cellClass = $(cells[8]).find('div').attr('class') || '';
          if (rowClass.includes('green') || cellClass.includes('green') || rowClass.includes('win')) {
            result = 'win';
          } else if (rowClass.includes('red') || cellClass.includes('red') || rowClass.includes('loss')) {
            result = 'loss';
          } else if (scoreText.includes(':')) {
            // Has a score, determine from context
            result = 'pending'; // Will be resolved by checking tip vs score
          }
        }

        tips.push({
          match_name: matchName,
          tip_type: tipType,
          stake,
          odds,
          final_score: scoreText || null,
          result,
          sport: 'soccer', // Default, can be enriched
        });
      }
    }
  });

  return {
    stats: { win_rate, total_tips, wins, losses, avg_odds, profit_units },
    tips,
  };
}

/**
 * Scrape today's tips from the remainder page.
 */
export async function scrapeTodaysTips(): Promise<(Partial<Tip> & { tipster_username: string })[]> {
  const html = await fetchPage('/pozostali/remainder');
  const $ = cheerio.load(html);
  const tips: (Partial<Tip> & { tipster_username: string })[] = [];

  $('table tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 8) {
      const tipsterLink = $(cells[1]).find('a');
      const username = tipsterLink.text().trim();
      const matchTime = $(cells[2]).text().trim();
      const matchName = $(cells[4]).text().trim();
      const tipType = $(cells[5]).text().trim();
      const stake = parseFloat($(cells[6]).text().trim()) || undefined;
      const odds = parseFloat($(cells[7]).text().trim()) || 0;
      const sport = $(cells[8]).text().trim().toLowerCase() || 'soccer';

      if (username && matchName && odds > 0) {
        tips.push({
          tipster_username: username,
          match_name: matchName,
          tip_type: tipType,
          stake,
          odds,
          match_time: matchTime || null,
          match_date: new Date().toISOString().split('T')[0],
          sport,
          result: 'pending',
        });
      }
    }
  });

  return tips;
}

/**
 * Full scrape pipeline with rate limiting.
 */
export async function scrapeAll(): Promise<{
  tipsters: { data: Partial<Tipster>; tips: Partial<Tip>[] }[];
  todaysTips: (Partial<Tip> & { tipster_username: string })[];
}> {
  // 1. Get ranking
  const ranking = await scrapeRanking();
  await delay(1000);

  // 2. Scrape each tipster profile
  const tipsters: { data: Partial<Tipster>; tips: Partial<Tip>[] }[] = [];
  for (const tipster of ranking.slice(0, 20)) { // Top 20 to start
    try {
      const profile = await scrapeTipsterProfile(tipster.typersi_id!, tipster.username!);
      tipsters.push({
        data: {
          ...tipster,
          ...profile.stats,
        },
        tips: profile.tips,
      });
      await delay(500); // Rate limit
    } catch (e) {
      console.error(`Failed to scrape ${tipster.username}:`, e);
    }
  }

  // 3. Get today's tips
  const todaysTips = await scrapeTodaysTips();

  return { tipsters, todaysTips };
}
