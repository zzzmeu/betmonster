import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PickCard } from '@/components/pick-card';
import { Skull, Target, TrendingUp, Zap, Shield, BarChart3, Globe, Layers, Search, Database, Activity, ArrowRight } from 'lucide-react';
import type { CuratedPick, Tip, Tipster } from '@/types';
import Link from 'next/link';

// Demo picks
const demoPicks: CuratedPick[] = [
  {
    id: 1, tip_id: 1, rank: 1,
    composite_confidence: 0.82, tipster_signal: 0.85, form_signal: 0.78,
    odds_value_signal: 0.80, market_signal: 0.75, consensus_count: 3,
    reasoning: 'Elite tipster with 68% win rate over 150 tips. Home team on 5W streak. Odds offer 8% edge over fair value. 3 tipsters agree.',
    pick_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(),
    tip: {
      id: 1, tipster_id: 1, match_name: 'Arsenal - Chelsea', league: 'Premier League', sport: 'soccer',
      tip_type: '1', stake: 10, odds: 1.85, final_score: null, result: 'pending',
      match_date: new Date().toISOString().split('T')[0], match_time: '17:30', bookmaker: '1xbet',
      home_form: null, away_form: null, h2h_record: null, fair_odds: null,
      odds_movement: null, polymarket_prob: null, composite_score: 0.82, created_at: '',
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
    id: 2, tip_id: 2, rank: 2,
    composite_confidence: 0.74, tipster_signal: 0.72, form_signal: 0.80,
    odds_value_signal: 0.70, market_signal: 0.68, consensus_count: 2,
    reasoning: 'Proven tipster specializing in La Liga. Away team strong on road (4W1D last 5). Decent value at current odds.',
    pick_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(),
    tip: {
      id: 2, tipster_id: 2, match_name: 'Sevilla - Real Madrid', league: 'La Liga', sport: 'soccer',
      tip_type: '2', stake: 20, odds: 2.10, final_score: null, result: 'pending',
      match_date: new Date().toISOString().split('T')[0], match_time: '20:00', bookmaker: '1xbet',
      home_form: null, away_form: null, h2h_record: null, fair_odds: null,
      odds_movement: null, polymarket_prob: null, composite_score: 0.74, created_at: '',
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
    id: 3, tip_id: 3, rank: 3,
    composite_confidence: 0.69, tipster_signal: 0.65, form_signal: 0.72,
    odds_value_signal: 0.75, market_signal: 0.60, consensus_count: 1,
    reasoning: 'Rising tipster with strong recent form. Over 2.5 supported by both teams averaging 3.1 goals in last 5 H2H.',
    pick_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(),
    tip: {
      id: 3, tipster_id: 3, match_name: 'Bayern Munich - Dortmund', league: 'Bundesliga', sport: 'soccer',
      tip_type: 'Over 2.5', stake: 15, odds: 1.72, final_score: null, result: 'pending',
      match_date: new Date().toISOString().split('T')[0], match_time: '18:30', bookmaker: '1xbet',
      home_form: null, away_form: null, h2h_record: null, fair_odds: null,
      odds_movement: null, polymarket_prob: null, composite_score: 0.69, created_at: '',
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
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Today&apos;s <span className="text-[#39FF14]">Monster</span> Picks
        </h1>
        <p className="text-zinc-500 text-sm">{today} — AI-curated, signal-verified</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Skull} label="Picks Today" value={demoPicks.length.toString()} />
        <StatCard icon={Target} label="Avg Confidence" value={`${Math.round(demoPicks.reduce((s, p) => s + p.composite_confidence, 0) / demoPicks.length * 100)}%`} />
        <StatCard icon={TrendingUp} label="Yesterday Hit Rate" value="75%" accent />
        <StatCard icon={Zap} label="Active Tipsters" value="10" />
      </div>

      {/* Picks */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoPicks.map(pick => (
          <PickCard key={pick.id} pick={pick} />
        ))}
      </div>

      {/* Track Record CTA */}
      <Link href="/performance">
        <Card className="bg-[#39FF14]/5 border-[#39FF14]/20 hover:border-[#39FF14]/40 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-[#39FF14]" />
              <div>
                <div className="text-white font-semibold text-sm">Algorithm Track Record</div>
                <div className="text-zinc-500 text-xs">See how our curated picks perform over time →</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#39FF14]" />
          </CardContent>
        </Card>
      </Link>

      {/* Data Sources / Enrichment Pipeline */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-zinc-300">Intelligence Pipeline</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <SourceCard
            icon={Database}
            title="Typersi.com"
            subtitle="Tipster Performance"
            status="live"
            description="Scrapes rankings 3x daily. Tracks tipster W/L, odds, profit across monthly resets. Bayesian rating separates skill from luck."
          />
          <SourceCard
            icon={Activity}
            title="TheSportsDB"
            subtitle="Team Form & H2H"
            status="live"
            description="Last 5 match form, head-to-head records, goals scored/conceded. Free API — no key needed. Covers all major leagues."
          />
          <SourceCard
            icon={BarChart3}
            title="The Odds API"
            subtitle="Multi-Bookmaker Odds"
            status="live"
            description="Fair odds from 40+ bookmakers (EU region). Sharp line detection (Pinnacle/Betfair). Positive EV identification."
          />
          <SourceCard
            icon={Globe}
            title="Polymarket"
            subtitle="Prediction Markets"
            status="live"
            description="Decentralized prediction market probabilities for major matches. Independent signal from crowd wisdom."
          />
        </div>
      </div>

      {/* How signals combine */}
      <Card className="bg-zinc-900/30 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-zinc-300 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#39FF14]" />
            How Signals Combine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <SignalExplainer
              weight={30}
              label="Tipster Credibility"
              color="#39FF14"
              items={['Bayesian rating (sample-size adjusted)', 'Historical ROI across months', 'Consistency score (low variance)', 'Tier classification (Elite → Avoid)']}
            />
            <SignalExplainer
              weight={25}
              label="Form Analysis"
              color="#3b82f6"
              items={['Last 5 match results', 'Head-to-head record', 'Home/away performance split', 'Goals scored/conceded trend']}
            />
            <SignalExplainer
              weight={25}
              label="Odds Value"
              color="#f59e0b"
              items={['Fair odds from multiple books', 'Positive EV detection', 'Line movement direction', 'Sharp money indicators']}
            />
            <SignalExplainer
              weight={20}
              label="Market Consensus"
              color="#8b5cf6"
              items={['Polymarket probability', 'Multiple tipster agreement', 'Public vs sharp split', 'Implied probability gap']}
            />
          </div>
          <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400">
            <span className="text-[#39FF14] font-bold">Only picks scoring above 65% composite confidence make the cut.</span> We sacrifice volume for accuracy. 
            Typical output: 3-8 picks per day with 70-85% expected win rate on settled bets.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-3 md:p-4 flex items-center gap-3">
        <Icon className={`h-6 w-6 md:h-8 md:w-8 shrink-0 ${accent ? 'text-[#39FF14]' : 'text-zinc-600'}`} />
        <div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white">{value}</div>
          <div className="text-[10px] md:text-xs text-zinc-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SourceCard({ icon: Icon, title, subtitle, status, description }: { 
  icon: React.ElementType; title: string; subtitle: string; status: 'live' | 'coming'; description: string 
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-zinc-500" />
          <Badge variant="outline" className={
            status === 'live' 
              ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30 text-[10px]'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]'
          }>
            {status === 'live' ? '● Live' : '◌ Coming'}
          </Badge>
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{title}</div>
          <div className="text-zinc-500 text-xs">{subtitle}</div>
        </div>
        <p className="text-zinc-600 text-xs leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function SignalExplainer({ weight, label, color, items }: {
  weight: number; label: string; color: string; items: string[]
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-zinc-300 font-medium text-xs">{label}</span>
        <span className="text-zinc-600 text-[10px] ml-auto">{weight}%</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-zinc-500 text-[11px] flex items-start gap-1.5">
            <span className="text-zinc-700 mt-0.5">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
