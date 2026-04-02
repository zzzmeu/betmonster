import { Badge } from '@/components/ui/badge';

interface ConfidenceBadgeProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceBadge({ confidence, size = 'md' }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);
  
  let color = 'bg-red-500/20 text-red-400 border-red-500/30';
  let label = 'Low';
  
  if (pct >= 80) {
    color = 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/30';
    label = 'Elite';
  } else if (pct >= 65) {
    color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    label = 'Strong';
  } else if (pct >= 50) {
    color = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    label = 'Moderate';
  }

  const textSize = size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <Badge variant="outline" className={`${color} ${textSize} font-mono`}>
      {pct}% {label}
    </Badge>
  );
}
