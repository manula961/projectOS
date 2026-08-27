import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncGitHubTimeline } from '@/lib/github/sync';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allowed = process.env.PROJECTOS_ADMIN_EMAIL?.trim().toLowerCase();
  if (allowed && user.email?.toLowerCase() !== allowed) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const result = await syncGitHubTimeline(supabase, user.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sync failed' }, { status: 500 });
  }
}
