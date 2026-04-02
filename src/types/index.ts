export interface Tipster {
  id: number;
  typersi_id: number;
  username: string;
  profile_url: string | null;
  total_tips: number;
  wins: number;
  losses: number;
  avg_odds: number;
  profit_units: number;
  win_rate: number;
  bayesian_rating: number;
  roi: number;
  consistency_score: number;
  specialization: Record<string, { wins: number; losses: number; win_rate: number }>;
  streak_current: number;
  streak_best: number;
  tier: 'elite' | 'proven' | 'rising' | 'unranked' | 'avoid';
  last_scraped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tip {
  id: number;
  tipster_id: number;
  match_name: string;
  league: string | null;
  sport: string;
  tip_type: string;
  stake: number | null;
  odds: number;
  final_score: string | null;
  result: 'win' | 'loss' | 'pending' | 'void';
  match_date: string | null;
  match_time: string | null;
  bookmaker: string | null;
  home_form: TeamForm | null;
  away_form: TeamForm | null;
  h2h_record: H2HRecord | null;
  fair_odds: number | null;
  odds_movement: OddsMovement | null;
  polymarket_prob: number | null;
  composite_score: number | null;
  created_at: string;
  // Joined
  tipster?: Tipster;
}

export interface TipsterSnapshot {
  id: number;
  tipster_id: number;
  snapshot_date: string;
  profit_units: number;
  win_rate: number;
  bayesian_rating: number;
  total_tips: number;
}

export interface CuratedPick {
  id: number;
  tip_id: number;
  rank: number;
  composite_confidence: number;
  tipster_signal: number;
  form_signal: number;
  odds_value_signal: number;
  market_signal: number;
  consensus_count: number;
  reasoning: string | null;
  pick_date: string;
  created_at: string;
  // Joined
  tip?: Tip;
}

export interface TeamForm {
  last_5: ('W' | 'D' | 'L')[];
  goals_scored: number;
  goals_conceded: number;
  points: number;
  position: number | null;
}

export interface H2HRecord {
  matches: number;
  home_wins: number;
  draws: number;
  away_wins: number;
  avg_goals: number;
}

export interface OddsMovement {
  opening: number;
  current: number;
  high: number;
  low: number;
  direction: 'shortening' | 'drifting' | 'stable';
}

export interface SignalBreakdown {
  tipster_signal: number;
  form_signal: number;
  odds_value_signal: number;
  market_signal: number;
  composite: number;
}
