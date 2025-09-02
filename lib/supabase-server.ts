import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value.startsWith('base64-')
                ? (() => {
                    const base64Value = cookie.value.replace('base64-', '');
                    try {
                      return Buffer.from(base64Value, 'base64').toString();
                    } catch {
                      return cookie.value;
                    }
                  })()
                : cookie.value,
            }));
          } catch (error) {
            console.warn('Failed to get all cookies:', error);
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch (error) {
            console.warn('Failed to set cookies:', error);
          }
        },
      },
    }
  );
}
