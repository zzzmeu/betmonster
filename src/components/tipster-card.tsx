import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { TierBadge } from './tier-badge';
import type { Tipster } from '@/types';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

interface TipsterCardProps {
  tipster: Tipster;
  rank: number;
}

export function TipsterCard({ tipster, rank }: TipsterCardProps) {
  return (
    <Link href={`/tipsters/${tipster.id}`}>
      <Card className="bg-zinc-900/50 border-zinc-800 hover:border-[#39FF14]/30 transition-all hover:scale-[1.01] cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-zinc-600 font-mono w-8">#{rank}</span>
              <div>
                <h3 className="text-white font-semibold">{tipster.username}</h3>
                <TierBadge tier={tipster.tier} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#39FF14] font-bold font-mono text-xl">
                {tipster.bayesian_rating.toFixed(2)}
              </div>
              <div className="text-zinc-500 text-xs">Rating</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Stat icon={Target} label="Win Rate" value={`${tipster.win_rate.toFixed(0)}%`} />
            <Stat icon={TrendingUp} label="ROI" value={`${tipster.roi.toFixed(1)}%`} positive={tipster.roi > 0} />
            <Stat icon={Zap} label="Tips" value={tipster.total_tips.toString()} />
            <Stat icon={Award} label="Profit" value={`${tipster.profit_units > 0 ? '+' : ''}${tipster.profit_units.toFixed(0)}u`} positive={tipster.profit_units > 0} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Stat({ icon: Icon, label, value, positive }: { icon: React.ElementType; label: string; value: string; positive?: boolean }) {
  return (
    <div className="text-center">
      <Icon className="h-3.5 w-3.5 mx-auto mb-1 text-zinc-600" />
      <div className={`text-sm font-mono font-bold ${positive === true ? 'text-[#39FF14]' : positive === false ? 'text-red-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-[10px] text-zinc-600">{label}</div>
    </div>
  );
}
