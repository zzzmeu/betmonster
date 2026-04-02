import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from '@/components/tier-badge';
import { Skull, Target, TrendingUp, Zap, BarChart3, Layers, Database, Activity, ArrowRight, Trophy, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { getTipsters } from '@/lib/data';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function getCuratedPicks() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const db = createClient(url, key);
  const today = new Date().toISOString().split('T')[0];
  const { data } = await db
    .from('curated_picks')
    .select('*, tip:tips(*, tipster:tipsters(*))')
    .eq('pick_date', today)
    .order('rank');
  return data || [];
}

async function getTodayStats() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { totalTips: 0, enriched: 0 };
  const db = createClient(url, key);
  const today = new Date().toISOString().split('T')[0];
  const { count: totalTips } = await db.from('tips').select('id', { count: 'exact', head: true }).eq('match_date', today);
  const { count: enriched } = await db.from('tips').select('id', { count: 'exact', head: true }).eq('match_date', today).not('home_form', 'is', null);
  return { totalTips: totalTips || 0, enriched: enriched || 0 };
}

export default async function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const [picks, tipsters, stats] = await Promise.all([
    getCuratedPicks(),
    getTipsters('bayesian_rating', 10),
    getTodayStats(),
  ]);
  const isLive = picks.length > 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Today&apos;s <span className="text-[#39FF14]">Monster</span> Picks
        </h1>
        <p className="text-zinc-500 text-sm">
          {today} — {isLive ? 'Live data' : 'Awaiting curation'}
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Skull} label="Curated Picks" value={picks.length.toString()} />
        <StatCard icon={Target} label="Tips Today" value={stats.totalTips.toString()} />
        <StatCard icon={Activity} label="Enriched" value={stats.enriched.toString()} accent={stats.enriched > 0} />
        <StatCard icon={Zap} label="Tipsters Tracked" value={tipsters.length.toString()} />
      </div>

      {/* CURATED PICKS — full transparency */}
      {picks.length > 0 ? (
        <div className="space-y-4">
          {picks.map((pick: Record<string, unknown>) => {
            const tip = pick.tip as Record<string, unknown> | null;
            const tipster = tip?.tipster as Record<string, unknown> | null;
            if (!tip || !tipster) return null;

            const homeForm = tip.home_form as Record<string, unknown> | null;
            const awayForm = tip.away_form as Record<string, unknown> | null;
            const h2h = tip.h2h_record as Record<string, unknown> | null;
            const matchParts = ((tip.match_name as string) || '').split(' - ');

            return (
              <Card key={pick.id as number} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 md:p-5 space-y-4">
                  {/* Header: rank + match + confidence */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl font-bold text-[#39FF14] font-mono shrink-0">#{pick.rank as number}</span>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-base md:text-lg truncate">{tip.match_name as string}</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-zinc-500 text-xs">{String(tip.league || tip.sport || 'Soccer')}</span>
                          {tip.match_time ? <span className="text-zinc-600 text-xs">• {String(tip.match_time)}</span> : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[#39FF14] font-bold font-mono text-xl">
                        {((pick.composite_confidence as number) * 100).toFixed(0)}%
                      </div>
                      <div className="text-zinc-600 text-[10px]">confidence</div>
                    </div>
                  </div>

                  {/* Tip + Odds */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="bg-[#39FF14]/10 px-3 py-1.5 rounded-lg">
                      <span className="text-[#39FF14] font-bold">{tip.tip_type as string}</span>
                    </div>
                    <span className="text-zinc-400 text-sm">@ <span className="text-white font-mono">{tip.odds as number}</span></span>
                    {tip.fair_odds ? (
                      <span className="text-zinc-500 text-xs">fair: {Number(tip.fair_odds).toFixed(2)}</span>
                    ) : null}
                    {(pick.consensus_count as number) > 1 && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                        🔥 {pick.consensus_count as number} tipsters agree
                      </Badge>
                    )}
                  </div>

                  {/* Signal bars */}
                  <div className="grid grid-cols-3 gap-3">
                    <SignalBar label="Tipster (60%)" value={pick.tipster_signal as number} color="#39FF14" />
                    <SignalBar label="Form (25%)" value={pick.form_signal as number} color="#3b82f6" />
                    <SignalBar label="Odds Value (15%)" value={pick.odds_value_signal as number} color="#f59e0b" />
                  </div>

                  {/* TIPSTER CARD — who suggested this */}
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded bg-zinc-700 flex items-center justify-center text-xs font-bold text-[#39FF14]">
                          {(tipster.username as string)[0].toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/tipsters/${tipster.id}`} className="text-white text-sm font-medium hover:text-[#39FF14] transition-colors">
                            {tipster.username as string}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <TierBadge tier={(tipster.tier as string) as 'elite' | 'proven' | 'rising' | 'unranked' | 'avoid'} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-zinc-300 font-mono">{(tipster.bayesian_rating as number).toFixed(2)} rating</div>
                        <div className="text-zinc-500">{tipster.total_tips as number} tips • {(tipster.win_rate as number).toFixed(0)}% WR • {(tipster.roi as number).toFixed(1)}% ROI</div>
                      </div>
                    </div>
                  </div>

                  {/* ENRICHMENT DATA — what supports this pick */}
                  {(homeForm || awayForm || h2h) && (
                    <div className="bg-zinc-800/30 rounded-lg p-3 space-y-2">
                      <div className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Match Intelligence</div>
                      
                      {/* Team Form */}
                      {(homeForm || awayForm) ? (
                        <div className="grid grid-cols-2 gap-2">
                          {matchParts[0] ? (
                            <div className="text-xs">
                              <span className="text-zinc-400">{matchParts[0].trim()}</span>
                              {homeForm?.last_5 ? (
                                <div className="flex gap-0.5 mt-1">
                                  {(homeForm.last_5 as string[]).map((r: string, i: number) => (
                                    <span key={i} className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                      r === 'W' ? 'bg-[#39FF14]/20 text-[#39FF14]' :
                                      r === 'D' ? 'bg-zinc-700 text-zinc-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>{r}</span>
                                  ))}
                                </div>
                              ) : null}
                              {homeForm ? <span className="text-zinc-600 text-[10px]">{`GF:${homeForm.goals_scored} GA:${homeForm.goals_conceded}`}</span> : null}
                            </div>
                          ) : null}
                          {matchParts[1] ? (
                            <div className="text-xs">
                              <span className="text-zinc-400">{matchParts[1].trim()}</span>
                              {awayForm?.last_5 ? (
                                <div className="flex gap-0.5 mt-1">
                                  {(awayForm.last_5 as string[]).map((r: string, i: number) => (
                                    <span key={i} className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                      r === 'W' ? 'bg-[#39FF14]/20 text-[#39FF14]' :
                                      r === 'D' ? 'bg-zinc-700 text-zinc-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>{r}</span>
                                  ))}
                                </div>
                              ) : null}
                              {awayForm ? <span className="text-zinc-600 text-[10px]">{`GF:${awayForm.goals_scored} GA:${awayForm.goals_conceded}`}</span> : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {/* H2H */}
                      {h2h && Number(h2h.matches) > 0 ? (
                        <div className="text-xs text-zinc-400 flex items-center gap-2 pt-1 border-t border-zinc-800">
                          <span className="text-zinc-500">{`H2H (${h2h.matches} matches):`}</span>
                          <span className="text-[#39FF14]">{`${h2h.home_wins}W`}</span>
                          <span className="text-zinc-500">{`${h2h.draws}D`}</span>
                          <span className="text-red-400">{`${h2h.away_wins}L`}</span>
                          <span className="text-zinc-600">{`(${Number(h2h.avg_goals).toFixed(1)} avg goals)`}</span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Reasoning */}
                  {pick.reasoning ? (
                    <p className="text-zinc-500 text-xs leading-relaxed">{String(pick.reasoning)}</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8 text-center">
            <Skull className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No curated picks yet today.</p>
            <p className="text-zinc-600 text-xs mt-1">Picks are generated after scrape → enrich → curate pipeline runs (3x daily at 08:20, 14:20, 20:20 UTC).</p>
          </CardContent>
        </Card>
      )}

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

      {/* Tipster Leaderboard */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-zinc-300">Top Tipsters</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* All-Time (BetMonster Bayesian) */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                BetMonster Rating (All-Time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {tipsters.slice(0, 5).map((t, i) => (
                  <Link href={`/tipsters/${t.id}`} key={t.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 rounded px-1 -mx-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 font-mono text-xs w-5">#{i + 1}</span>
                      <span className="text-white text-sm font-medium">{t.username}</span>
                      <TierBadge tier={t.tier} />
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-500">{t.total_tips} tips</span>
                      <span className="text-zinc-400">{t.win_rate.toFixed(0)}%</span>
                      <span className="text-[#39FF14] font-mono font-bold">{t.bayesian_rating.toFixed(2)}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {tipsters.length === 0 && <p className="text-zinc-600 text-xs">No tipsters tracked yet.</p>}
            </CardContent>
          </Card>

          {/* Current month profit leaders */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#39FF14]" />
                This Month (Profit Leaders)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {[...tipsters].sort((a, b) => b.profit_units - a.profit_units).slice(0, 5).map((t, i) => (
                  <Link href={`/tipsters/${t.id}`} key={t.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 rounded px-1 -mx-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 font-mono text-xs w-5">#{i + 1}</span>
                      <span className="text-white text-sm font-medium">{t.username}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-500">{t.total_tips} tips</span>
                      <span className="text-[#39FF14] font-mono font-bold">+{t.profit_units.toFixed(0)}u</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Intelligence Pipeline */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-zinc-300">Intelligence Pipeline</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <SourceCard icon={Database} title="Typersi.com" subtitle="Tipster Performance" status="live"
            description="Scrapes rankings 3x daily. Tracks W/L, odds, profit across monthly resets. Bayesian rating separates skill from luck." />
          <SourceCard icon={Activity} title="TheSportsDB" subtitle="Team Form & H2H" status="live"
            description="Last 5 match form, head-to-head records, goals scored/conceded. Covers all major leagues." />
          <SourceCard icon={BarChart3} title="The Odds API" subtitle="Multi-Bookmaker Odds" status="live"
            description="Fair odds from 40+ bookmakers. Sharp line detection (Pinnacle/Betfair). Positive EV identification." />
        </div>
      </div>

      {/* Signal weights */}
      <Card className="bg-zinc-900/30 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-zinc-300 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#39FF14]" />
            How We Score Picks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <SignalExplainer weight={60} label="Tipster Track Record" color="#39FF14"
              items={['Bayesian rating (sample-size adjusted)', 'Historical ROI across monthly resets', 'Win rate with minimum 10+ tips', 'Consistency score (low variance)', 'Tier: Elite → Proven → Rising → Avoid']} />
            <SignalExplainer weight={25} label="Team Form & H2H" color="#3b82f6"
              items={['Last 5 match results per team', 'Head-to-head record (3+ meetings)', 'Goals scored/conceded trend', 'Over/under market support']} />
            <SignalExplainer weight={15} label="Odds Value" color="#f59e0b"
              items={['Fair odds from multiple bookmakers', 'Positive expected value detection', 'Sharp line movement (Pinnacle)', 'Negative EV = auto-penalized']} />
          </div>
          <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400">
            <span className="text-[#39FF14] font-bold">Top 5 picks daily.</span> Tipster credibility is 60% of the score. Only picks from top-performing tipsters with verified track records surface. We track every pick&apos;s outcome to grade the algorithm.
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

function SignalExplainer({ weight, label, color, items }: { weight: number; label: string; color: string; items: string[] }) {
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
            <span className="text-zinc-700 mt-0.5">·</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignalBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-zinc-500">{label}</span>
        <span className="text-[10px] font-mono text-zinc-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
