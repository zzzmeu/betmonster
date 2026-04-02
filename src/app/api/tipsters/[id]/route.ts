import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'No DB' }, { status: 500 });
  }

  const db = createClient(url, key);

  // Fetch tipster
  const { data: tipster, error: tErr } = await db
    .from('tipsters')
    .select('*')
    .eq('id', id)
    .single();

  if (tErr || !tipster) {
    return NextResponse.json({ error: 'Tipster not found' }, { status: 404 });
  }

  // Fetch tips
  const { data: tips } = await db
    .from('tips')
    .select('*')
    .eq('tipster_id', id)
    .order('match_date', { ascending: false })
    .limit(100);

  // Fetch snapshots
  const { data: snapshots } = await db
    .from('tipster_snapshots')
    .select('*')
    .eq('tipster_id', id)
    .order('snapshot_date', { ascending: true });

  // Fetch monthly summaries
  const { data: monthly } = await db
    .from('tipster_monthly')
    .select('*')
    .eq('tipster_id', id)
    .order('month', { ascending: true });

  return NextResponse.json({
    tipster,
    tips: tips || [],
    snapshots: snapshots || [],
    monthly: monthly || [],
  });
}
