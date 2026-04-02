# BetMonster — Task Plan

## Goal
Build a tipster intelligence platform that scrapes typersi.com daily, builds historical profiles across monthly resets, cross-references picks with external data, and produces a curated daily shortlist of high-confidence picks.

## Key Insight
Typersi resets rankings monthly. We become the persistent memory — accumulating data across resets to identify truly skilled tipsters vs lucky streaks.

---

## Phases

### Phase 1: Infrastructure ✅ `complete`
- [x] GitHub repo created (zzzmeu/betmonster)
- [x] Next.js 15 + shadcn/ui + Tailwind scaffolded
- [x] Supabase project created (glbqwialrbgrbkskhiuu, Frankfurt)
- [x] Schema deployed (tipsters, tips, tipster_snapshots, curated_picks)
- [x] Vercel deployed (betmonster.vercel.app, auto-deploys)
- [x] Env vars set on Vercel
- [x] UI: Dashboard, Tipsters, Tipster Profile, Picks pages (demo data)

### Phase 2: Live Scraper + DB + UI Overhaul 🔄 `in_progress`
- [ ] Wire scraper to Supabase (upsert tipsters + tips)
- [ ] Store daily snapshots on each scrape run
- [ ] Run scoring pipeline after scrape (Bayesian rating, ROI, consistency, tier)
- [ ] Add Vercel cron (twice daily: 08:00 + 20:00 UTC)
- [ ] Replace ALL demo data with live Supabase queries
- [ ] Mobile-first bottom nav (replace top menu)
- [ ] Tipster historical performance (cross-month charts, monthly comparison)
- [ ] Algorithm performance tracking table (track our curated picks W/L)
- [ ] Dashboard enrichment section (explain data sources visually)
- [ ] Test full scrape → store → display pipeline

### Phase 3: Match Enrichment — Real Data Sources `pending`
- [ ] API-Football integration (team form, H2H, standings, injuries)
- [ ] Flashscore scrape fallback for form data
- [ ] Odds-API.com integration (multi-bookmaker odds comparison)
- [ ] Polymarket API for prediction market data
- [ ] Fair odds calculation from multiple sources
- [ ] Store all enrichment data on tips table

### Phase 4: Signal Fusion & Curation `pending`
- [ ] Live signal fusion scoring per pending tip
- [ ] Daily curated picks generation with real enrichment
- [ ] Consensus detection (multiple tipsters on same match)
- [ ] Kelly criterion position sizing suggestions
- [ ] Reasoning generation per pick

### Phase 5: Performance Loop `pending`
- [ ] Auto-resolve curated picks (check results next day)
- [ ] Rolling algorithm accuracy dashboard
- [ ] Adjust signal weights based on historical accuracy
- [ ] Alert system (Telegram for high-confidence picks)
- [ ] Monthly tipster comparison reports

---

## Architecture
- **Frontend:** Next.js 15 App Router, dark theme, #39FF14 accent
- **Backend:** Supabase PostgreSQL, service role for mutations
- **Scraper:** cheerio-based HTML parsing of typersi.com
- **Deploy:** Vercel (auto-deploy on push to main)
- **Cron:** Vercel cron jobs for scheduled scraping

## Key Files
| File | Purpose |
|------|---------|
| `src/lib/scraper.ts` | Typersi scraper |
| `src/lib/scoring.ts` | Bayesian rating + metrics |
| `src/lib/signal-fusion.ts` | Composite signal scoring |
| `src/lib/supabase.ts` | DB client |
| `src/app/api/scrape/route.ts` | Scrape API endpoint |
| `supabase/schema.sql` | Full DB schema |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Claude Code not authed | 1 | Built directly instead of delegating |
| recharts formatter type | 1 | Changed to `Number(value).toFixed(2)` |
| git push main vs master | 1 | Used `git push origin HEAD:main` |
