'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { TipsterSnapshot } from '@/types';

interface PerformanceChartProps {
  data: TipsterSnapshot[];
  metric?: 'profit_units' | 'win_rate' | 'bayesian_rating';
  height?: number;
}

export function PerformanceChart({ data, metric = 'profit_units', height = 300 }: PerformanceChartProps) {
  const labels: Record<string, string> = {
    profit_units: 'Profit (units)',
    win_rate: 'Win Rate (%)',
    bayesian_rating: 'Rating',
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-zinc-500 text-sm">
        No historical data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="snapshot_date"
          stroke="#52525b"
          fontSize={11}
          tickFormatter={(v: string) => v.slice(5)} // MM-DD
        />
        <YAxis stroke="#52525b" fontSize={11} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#a1a1aa' }}
          itemStyle={{ color: '#39FF14' }}
          formatter={(value) => [Number(value).toFixed(2), labels[metric]]}
        />
        <Area
          type="monotone"
          dataKey={metric}
          stroke="#39FF14"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorMetric)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MiniSparkline({ data, height = 40 }: { data: number[]; height?: number }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const isPositive = data.length > 1 && data[data.length - 1] >= data[0];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={isPositive ? '#39FF14' : '#ef4444'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
