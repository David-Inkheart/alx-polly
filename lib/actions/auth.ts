'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required',
      status: 400,
    };
  }

  if (!email.includes('@')) {
    return {
      success: false,
      error: 'Please enter a valid email address',
      status: 400,
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Differentiate between auth errors (client-side) and server errors
    if (error?.code?.includes('invalid_credentials') ||
        error.message.includes('Invalid login credentials') ||
        error.message.includes('Email not confirmed') ||
        error.message.includes('User not found')) {
      return {
        success: false,
        error: error.message,
        status: error.status, // Unauthorized - client error
      };
    }

    // Other Supabase errors (server-side issues)
    return {
      success: false,
      error: 'Authentication service temporarily unavailable',
      status: 500,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/polls');
}

export async function signUp(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  if (!email || !password || !fullName) {
    return {
      success: false,
      error: 'Email, password, and full name are required',
      status: 400,
    };
  }

  if (!email.includes('@')) {
    return {
      success: false,
      error: 'Please enter a valid email address',
      status: 400,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }/auth/callback`,
    },
  });

  if (error) {
    // Handle specific signup errors
    if (error.message.includes('User already registered') ||
        error.message.includes('already been registered')) {
      return {
        success: false,
        error: 'An account with this email already exists',
        status: 409, // Conflict
      };
    }

    // Other Supabase errors (server-side issues)
    return {
      success: false,
      error: 'Registration service temporarily unavailable',
      status: 500,
    };
  }

  // If user is immediately signed in (email confirmation disabled)
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/polls');
  }

  // Return success message for email confirmation flow
  return {
    success: true,
    message: 'Check your email to confirm your account, then log in.',
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: 'Sign out failed',
      status: 500,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
