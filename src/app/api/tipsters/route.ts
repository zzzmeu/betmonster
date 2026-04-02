import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ tipsters: [], source: 'no-db' });
  }

  const db = createClient(url, key);
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'bayesian_rating';
  const limit = parseInt(searchParams.get('limit') || '50');

  const { data, error } = await db
    .from('tipsters')
    .select('*')
    .order(sort, { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tipsters: data || [], source: 'live' });
}
