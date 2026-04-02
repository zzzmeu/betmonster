import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ picks: [], source: 'no-db' });
  }

  const db = createClient(url, key);
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Get today's pending tips with tipster info
  const { data: tips } = await db
    .from('tips')
    .select('*, tipster:tipsters(*)')
    .eq('match_date', date)
    .order('odds', { ascending: false });

  // Get curated picks for today
  const { data: curated } = await db
    .from('curated_picks')
    .select('*, tip:tips(*, tipster:tipsters(*))')
    .eq('pick_date', date)
    .order('rank');

  return NextResponse.json({
    tips: tips || [],
    curated: curated || [],
    date,
    source: 'live',
  });
}
