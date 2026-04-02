'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceChart } from '@/components/performance-chart';
import type { TipsterSnapshot } from '@/types';

export function ProfileCharts({ snapshots }: { snapshots: TipsterSnapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-8 text-center text-zinc-500 text-sm">
          No historical data yet. Charts will appear after daily scraping accumulates data.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-zinc-400">Profit Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={snapshots} metric="profit_units" height={220} />
        </CardContent>
      </Card>
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-zinc-400">Win Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={snapshots} metric="win_rate" height={220} />
        </CardContent>
      </Card>
    </div>
  );
}
