import { Badge } from '@/components/ui/badge';
import type { Tipster } from '@/types';

const tierConfig: Record<Tipster['tier'], { color: string; label: string }> = {
  elite: { color: 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/30', label: '👑 Elite' },
  proven: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '✓ Proven' },
  rising: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: '↗ Rising' },
  unranked: { color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', label: '? Unranked' },
  avoid: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: '✗ Avoid' },
};

export function TierBadge({ tier }: { tier: Tipster['tier'] }) {
  const config = tierConfig[tier];
  return (
    <Badge variant="outline" className={`${config.color} text-xs`}>
      {config.label}
    </Badge>
  );
}
