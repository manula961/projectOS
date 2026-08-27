import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const adminEmail = process.env.PROJECTOS_ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail) {
    return NextResponse.json(
      { authorized: false, message: 'ProjectOS administrator email is not configured.' },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { authorized: false, message: 'Authentication session could not be verified.' },
      { status: 401 },
    );
  }

  const userEmail = user.email?.trim().toLowerCase();

  if (!userEmail || userEmail !== adminEmail) {
    return NextResponse.json(
      { authorized: false, message: 'This account is not authorized to access ProjectOS.' },
      { status: 403 },
    );
  }

  return NextResponse.json({ authorized: true });
}
