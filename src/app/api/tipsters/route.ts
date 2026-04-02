import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // TODO: Fetch from Supabase
  // const { data, error } = await supabase
  //   .from('tipsters')
  //   .select('*')
  //   .order('bayesian_rating', { ascending: false });

  return NextResponse.json({
    message: 'Connect Supabase to fetch live tipster data',
    tipsters: [],
  });
}
