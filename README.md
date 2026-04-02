# 🦴 BetMonster

**Tipster intelligence platform** — separating signal from noise in sports betting.

Scrapes tipster data from typersi.com, builds Bayesian-rated profiles, cross-references picks with team form + odds movement + prediction markets, and delivers a curated daily shortlist of high-confidence picks.

## Architecture

### Three-Layer System

1. **Layer 1: Tipster Intelligence** — Bayesian rating adjusted for sample size, odds-weighted ROI, consistency scoring, specialization detection
2. **Layer 2: Match Verification** — Team form (Flashscore), odds comparison (fair value calc), Polymarket data
3. **Layer 3: Signal Fusion** — Weighted composite from 4 independent signals, only surfaces picks above 65% confidence

### Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS + shadcn/ui** — Dark theme, data-dense UI
- **Supabase** — PostgreSQL database
- **Recharts** — Performance graphs
- **Cheerio** — HTML scraping

## Getting Started

```bash
# Install
npm install

# Set up environment
cp .env.example .env.local
# Fill in Supabase credentials

# Run database schema
# Execute supabase/schema.sql in your Supabase SQL editor

# Dev
npm run dev

# Build
npm run build
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — today's top curated picks |
| `/tipsters` | All tipsters ranked by Bayesian rating |
| `/tipsters/[id]` | Individual profile with charts + history |
| `/picks` | All today's picks with analysis |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/scrape` | POST | Trigger scrape of typersi.com |
| `/api/tipsters` | GET | Fetch all tipsters |
| `/api/picks` | GET | Fetch today's curated picks |

## Scoring

**Bayesian Rating:** `(C × m + Σprofit) / (C + n)` where C=10 (prior weight), m=0 (prior mean)
- Prevents tipsters with 2 lucky wins from ranking above consistent performers with 100+ tips

**Composite Confidence:**
- Tipster credibility: 30%
- Form analysis: 25%
- Odds value (EV): 25%
- Market consensus: 20%

## License

MIT
