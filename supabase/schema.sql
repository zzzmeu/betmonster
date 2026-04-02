-- BetMonster Schema

-- Tipsters
CREATE TABLE tipsters (
  id SERIAL PRIMARY KEY,
  typersi_id INT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  profile_url TEXT,
  total_tips INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  avg_odds DECIMAL(5,2) DEFAULT 0,
  profit_units DECIMAL(8,2) DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  bayesian_rating DECIMAL(8,4) DEFAULT 0,
  roi DECIMAL(8,2) DEFAULT 0,
  consistency_score DECIMAL(5,2) DEFAULT 0,
  specialization JSONB DEFAULT '{}',
  streak_current INT DEFAULT 0,
  streak_best INT DEFAULT 0,
  tier TEXT DEFAULT 'unranked' CHECK (tier IN ('elite', 'proven', 'rising', 'unranked', 'avoid')),
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical tips
CREATE TABLE tips (
  id SERIAL PRIMARY KEY,
  tipster_id INT REFERENCES tipsters(id) ON DELETE CASCADE,
  match_name TEXT NOT NULL,
  league TEXT,
  sport TEXT DEFAULT 'soccer',
  tip_type TEXT NOT NULL,
  stake DECIMAL(5,2),
  odds DECIMAL(6,2) NOT NULL,
  final_score TEXT,
  result TEXT CHECK (result IN ('win', 'loss', 'pending', 'void')),
  match_date DATE,
  match_time TIME,
  bookmaker TEXT,
  home_form JSONB,
  away_form JSONB,
  h2h_record JSONB,
  fair_odds DECIMAL(6,2),
  odds_movement JSONB,
  polymarket_prob DECIMAL(5,4),
  composite_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tipster_id, match_name, match_date, tip_type)
);

-- Daily snapshots for graphing
CREATE TABLE tipster_snapshots (
  id SERIAL PRIMARY KEY,
  tipster_id INT REFERENCES tipsters(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  profit_units DECIMAL(8,2),
  win_rate DECIMAL(5,2),
  bayesian_rating DECIMAL(8,4),
  total_tips INT,
  UNIQUE(tipster_id, snapshot_date)
);

-- Curated daily picks
CREATE TABLE curated_picks (
  id SERIAL PRIMARY KEY,
  tip_id INT REFERENCES tips(id) ON DELETE CASCADE,
  rank INT,
  composite_confidence DECIMAL(5,2),
  tipster_signal DECIMAL(5,2),
  form_signal DECIMAL(5,2),
  odds_value_signal DECIMAL(5,2),
  market_signal DECIMAL(5,2),
  consensus_count INT DEFAULT 1,
  reasoning TEXT,
  pick_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Algorithm performance tracking
CREATE TABLE algo_performance (
  id SERIAL PRIMARY KEY,
  pick_date DATE NOT NULL,
  total_picks INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  voids INT DEFAULT 0,
  pending INT DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  profit_units DECIMAL(8,2) DEFAULT 0,
  avg_confidence DECIMAL(5,2) DEFAULT 0,
  avg_odds DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pick_date)
);

-- Monthly tipster summaries (cross-month comparison)
CREATE TABLE tipster_monthly (
  id SERIAL PRIMARY KEY,
  tipster_id INT REFERENCES tipsters(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- first day of month
  total_tips INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  profit_units DECIMAL(8,2) DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  avg_odds DECIMAL(5,2) DEFAULT 0,
  rank_end INT, -- their typersi rank at month end
  UNIQUE(tipster_id, month)
);

-- Indexes
CREATE INDEX idx_tips_tipster ON tips(tipster_id);
CREATE INDEX idx_tips_date ON tips(match_date);
CREATE INDEX idx_tips_result ON tips(result);
CREATE INDEX idx_tips_pending ON tips(result) WHERE result = 'pending';
CREATE INDEX idx_snapshots_tipster_date ON tipster_snapshots(tipster_id, snapshot_date);
CREATE INDEX idx_curated_date ON curated_picks(pick_date);
CREATE INDEX idx_tipsters_rating ON tipsters(bayesian_rating DESC);
CREATE INDEX idx_algo_perf_date ON algo_performance(pick_date);
CREATE INDEX idx_tipster_monthly ON tipster_monthly(tipster_id, month);
