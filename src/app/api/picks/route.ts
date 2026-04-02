import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // TODO: Fetch from Supabase with joins
  // const { data, error } = await supabase
  //   .from('curated_picks')
  //   .select('*, tip:tips(*, tipster:tipsters(*))')
  //   .eq('pick_date', new Date().toISOString().split('T')[0])
  //   .order('rank');

  return NextResponse.json({
    message: 'Connect Supabase to fetch live curated picks',
    picks: [],
  });
}
