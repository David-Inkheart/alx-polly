import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Destructure pathname for clearer route checks
  const { pathname } = req.nextUrl;
  // Match exactly "/polls" or anything under "/polls/"
  const isPollsRoute = pathname === '/polls' || pathname.startsWith('/polls/');
  if (!session && isPollsRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
