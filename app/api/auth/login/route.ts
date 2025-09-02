import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string'
  ) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
  const { email, password } = body;
  const supabase = await createSupabaseServerClient();

  const payload = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const { data, error } = payload;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Avoid exposing access/refresh tokens in JSON
  return NextResponse.json({
    user: {
      id: data.user?.id,
      email: data.user?.email,
    },
  });
}
