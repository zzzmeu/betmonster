import { createClient } from '@supabase/supabase-js';
import type { Tipster, Tip, TipsterSnapshot, CuratedPick } from '@/types';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function getTipsters(sort = 'bayesian_rating', limit = 50): Promise<Tipster[]> {
  const db = getClient();
  if (!db) return [];
  const { data } = await db
    .from('tipsters')
    .select('*')
    .order(sort, { ascending: false })
    .limit(limit);
  return (data as Tipster[]) || [];
}

export async function getTipster(id: number): Promise<Tipster | null> {
  const db = getClient();
  if (!db) return null;
  const { data } = await db
    .from('tipsters')
    .select('*')
    .eq('id', id)
    .single();
  return data as Tipster | null;
}

export async function getTipsterByTypersiId(typersiId: number): Promise<Tipster | null> {
  const db = getClient();
  if (!db) return null;
  const { data } = await db
    .from('tipsters')
    .select('*')
    .eq('typersi_id', typersiId)
    .single();
  return data as Tipster | null;
}

export async function getTipsterTips(tipsterId: number, limit = 100): Promise<Tip[]> {
  const db = getClient();
  if (!db) return [];
  const { data } = await db
    .from('tips')
    .select('*')
    .eq('tipster_id', tipsterId)
    .order('match_date', { ascending: false })
    .limit(limit);
  return (data as Tip[]) || [];
}

export async function getTipsterSnapshots(tipsterId: number): Promise<TipsterSnapshot[]> {
  const db = getClient();
  if (!db) return [];
  const { data } = await db
    .from('tipster_snapshots')
    .select('*')
    .eq('tipster_id', tipsterId)
    .order('snapshot_date', { ascending: true });
  return (data as TipsterSnapshot[]) || [];
}

export async function getTipsterMonthly(tipsterId: number) {
  const db = getClient();
  if (!db) return [];
  const { data } = await db
    .from('tipster_monthly')
    .select('*')
    .eq('tipster_id', tipsterId)
    .order('month', { ascending: true });
  return data || [];
}

export async function getTodaysTips(): Promise<(Tip & { tipster: Tipster })[]> {
  const db = getClient();
  if (!db) return [];
  const today = new Date().toISOString().split('T')[0];
  const { data } = await db
    .from('tips')
    .select('*, tipster:tipsters(*)')
    .eq('match_date', today)
    .order('created_at', { ascending: false });
  return (data as (Tip & { tipster: Tipster })[]) || [];
}

export async function getCuratedPicks(date?: string): Promise<CuratedPick[]> {
  const db = getClient();
  if (!db) return [];
  const d = date || new Date().toISOString().split('T')[0];
  const { data } = await db
    .from('curated_picks')
    .select('*, tip:tips(*, tipster:tipsters(*))')
    .eq('pick_date', d)
    .order('rank');
  return (data as CuratedPick[]) || [];
}

export async function getAlgoPerformance() {
  const db = getClient();
  if (!db) return [];
  const { data } = await db
    .from('algo_performance')
    .select('*')
    .order('pick_date', { ascending: false })
    .limit(90);
  return data || [];
}
