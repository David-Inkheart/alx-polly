import { createSupabaseServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();

  // Define schema inside the function to avoid hoisting issues
  const schema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(128),
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input.', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createSupabaseServerClient();

    // Use request.nextUrl for origin (NextRequest)
    const origin =
      (request as any).nextUrl?.origin ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Only return safe user data
    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to sign up user.' },
      { status: 500 }
    );
  }
}
