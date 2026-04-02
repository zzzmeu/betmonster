import { Card, CardContent } from '@/components/ui/card';
import { ConfidenceBadge } from './confidence-badge';
import { TierBadge } from './tier-badge';
import type { CuratedPick } from '@/types';
import { Trophy, TrendingUp, BarChart, Users } from 'lucide-react';

interface PickCardProps {
  pick: CuratedPick;
}

export function PickCard({ pick }: PickCardProps) {
  const tip = pick.tip;
  const tipster = tip?.tipster;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-[#39FF14]/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#39FF14] font-mono">#{pick.rank}</span>
            <ConfidenceBadge confidence={pick.composite_confidence} />
          </div>
          {tipster && <TierBadge tier={tipster.tier} />}
        </div>

        <div className="mb-3">
          <h3 className="text-white font-semibold text-lg">{tip?.match_name || 'Unknown Match'}</h3>
          <p className="text-zinc-500 text-sm">{tip?.league || tip?.sport || 'Soccer'}</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="bg-[#39FF14]/10 px-3 py-1.5 rounded-lg">
            <span className="text-[#39FF14] font-bold text-lg">{tip?.tip_type}</span>
          </div>
          <div className="text-zinc-400 text-sm">
            @ <span className="text-white font-mono">{tip?.odds}</span>
          </div>
          {tipster && (
            <div className="text-zinc-500 text-sm">
              by <span className="text-zinc-300">{tipster.username}</span>
            </div>
          )}
        </div>

        {/* Signal breakdown */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <SignalBar icon={Trophy} label="Tipster" value={pick.tipster_signal} />
          <SignalBar icon={TrendingUp} label="Form" value={pick.form_signal} />
          <SignalBar icon={BarChart} label="Value" value={pick.odds_value_signal} />
          <SignalBar icon={Users} label="Market" value={pick.market_signal} />
        </div>

        {pick.reasoning && (
          <p className="text-zinc-500 text-xs leading-relaxed">{pick.reasoning}</p>
        )}

        {pick.consensus_count > 1 && (
          <div className="mt-2 text-xs text-amber-400">
            🔥 {pick.consensus_count} tipsters agree
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SignalBar({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="text-center">
      <Icon className="h-3 w-3 mx-auto mb-1 text-zinc-500" />
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
        <div
          className="h-full bg-[#39FF14] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-zinc-600">{label}</span>
    </div>
  );
}
