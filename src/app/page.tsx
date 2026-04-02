import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PickCard } from '@/components/pick-card';
import { Skull, Target, TrendingUp, Zap } from 'lucide-react';
import type { CuratedPick, Tip, Tipster } from '@/types';

// Demo data for initial deploy — replaced by Supabase once connected
const demoPicks: CuratedPick[] = [
  {
    id: 1,
    tip_id: 1,
    rank: 1,
    composite_confidence: 0.82,
    tipster_signal: 0.85,
    form_signal: 0.78,
    odds_value_signal: 0.80,
    market_signal: 0.75,
    consensus_count: 3,
    reasoning: 'Elite tipster with 68% win rate over 150 tips. Home team on 5W streak. Odds offer 8% edge over fair value. 3 tipsters agree.',
    pick_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    tip: {
      id: 1,
      tipster_id: 1,
      match_name: 'Arsenal - Chelsea',
      league: 'Premier League',
      sport: 'soccer',
      tip_type: '1',
      stake: 10,
      odds: 1.85,
      final_score: null,
      result: 'pending',
      match_date: new Date().toISOString().split('T')[0],
      match_time: '17:30',
      bookmaker: '1xbet',
      home_form: null,
      away_form: null,
      h2h_record: null,
      fair_odds: null,
      odds_movement: null,
      polymarket_prob: null,
      composite_score: 0.82,
      created_at: new Date().toISOString(),
      tipster: {
        id: 1, typersi_id: 44116, username: 'outlaw76', profile_url: null,
        total_tips: 150, wins: 102, losses: 48, avg_odds: 2.1, profit_units: 137.1,
        win_rate: 68, bayesian_rating: 8.57, roi: 15.2, consistency_score: 72,
        specialization: {}, streak_current: 5, streak_best: 12, tier: 'elite',
        last_scraped_at: null, created_at: '', updated_at: '',
      },
    },
  },
  {
    id: 2,
    tip_id: 2,
    rank: 2,
    composite_confidence: 0.74,
    tipster_signal: 0.72,
    form_signal: 0.80,
    odds_value_signal: 0.70,
    market_signal: 0.68,
    consensus_count: 2,
    reasoning: 'Proven tipster specializing in La Liga. Away team strong on road (4W1D last 5). Decent value at current odds.',
    pick_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    tip: {
      id: 2,
      tipster_id: 2,
      match_name: 'Sevilla - Real Madrid',
      league: 'La Liga',
      sport: 'soccer',
      tip_type: '2',
      stake: 20,
      odds: 2.10,
      final_score: null,
      result: 'pending',
      match_date: new Date().toISOString().split('T')[0],
      match_time: '20:00',
      bookmaker: '1xbet',
      home_form: null, away_form: null, h2h_record: null,
      fair_odds: null, odds_movement: null, polymarket_prob: null,
      composite_score: 0.74,
      created_at: new Date().toISOString(),
      tipster: {
        id: 2, typersi_id: 48750, username: 'Baloniarz', profile_url: null,
        total_tips: 85, wins: 52, losses: 33, avg_odds: 1.95, profit_units: 132.0,
        win_rate: 61.2, bayesian_rating: 6.8, roi: 11.8, consistency_score: 65,
        specialization: {}, streak_current: 3, streak_best: 8, tier: 'proven',
        last_scraped_at: null, created_at: '', updated_at: '',
      },
    },
  },
  {
    id: 3,
    tip_id: 3,
    rank: 3,
    composite_confidence: 0.69,
    tipster_signal: 0.65,
    form_signal: 0.72,
    odds_value_signal: 0.75,
    market_signal: 0.60,
    consensus_count: 1,
    reasoning: 'Rising tipster with strong recent form. Over 2.5 supported by both teams averaging 3.1 goals in last 5 H2H.',
    pick_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    tip: {
      id: 3,
      tipster_id: 3,
      match_name: 'Bayern Munich - Dortmund',
      league: 'Bundesliga',
      sport: 'soccer',
      tip_type: 'Over 2.5',
      stake: 15,
      odds: 1.72,
      final_score: null,
      result: 'pending',
      match_date: new Date().toISOString().split('T')[0],
      match_time: '18:30',
      bookmaker: '1xbet',
      home_form: null, away_form: null, h2h_record: null,
      fair_odds: null, odds_movement: null, polymarket_prob: null,
      composite_score: 0.69,
      created_at: new Date().toISOString(),
      tipster: {
        id: 3, typersi_id: 50752, username: 'Kolba1', profile_url: null,
        total_tips: 42, wins: 27, losses: 15, avg_odds: 1.88, profit_units: 97.5,
        win_rate: 64.3, bayesian_rating: 4.7, roi: 8.5, consistency_score: 58,
        specialization: {}, streak_current: 2, streak_best: 6, tier: 'rising',
        last_scraped_at: null, created_at: '', updated_at: '',
      },
    },
  },
];

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Today&apos;s <span className="text-[#39FF14]">Monster</span> Picks
        </h1>
        <p className="text-zinc-500">{today} — AI-curated, signal-verified</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Skull} label="Picks Today" value={demoPicks.length.toString()} />
        <StatCard icon={Target} label="Avg Confidence" value={`${Math.round(demoPicks.reduce((s, p) => s + p.composite_confidence, 0) / demoPicks.length * 100)}%`} />
        <StatCard icon={TrendingUp} label="Yesterday Hit Rate" value="75%" accent />
        <StatCard icon={Zap} label="Active Tipsters" value="10" />
      </div>

      {/* Picks grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoPicks.map(pick => (
          <PickCard key={pick.id} pick={pick} />
        ))}
      </div>

      {/* How it works */}
      <Card className="bg-zinc-900/30 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-300">How BetMonster Works</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6 text-sm text-zinc-500">
          <div>
            <div className="text-[#39FF14] font-bold mb-1">1. Scrape & Profile</div>
            Tracks tipsters from typersi.com. Bayesian rating separates lucky streaks from real edge. Only proven performers pass.
          </div>
          <div>
            <div className="text-[#39FF14] font-bold mb-1">2. Verify & Enrich</div>
            Cross-references each pick with team form, H2H records, odds movement, and prediction market data.
          </div>
          <div>
            <div className="text-[#39FF14] font-bold mb-1">3. Fuse & Rank</div>
            Composite signal from 4 independent sources. Only picks above 65% confidence make the cut.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`h-8 w-8 ${accent ? 'text-[#39FF14]' : 'text-zinc-600'}`} />
        <div>
          <div className="text-2xl font-bold font-mono text-white">{value}</div>
          <div className="text-xs text-zinc-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
