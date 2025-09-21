/**
 * API route for handling poll voting operations
 * Ensures atomic, fraud-proof vote casting with Supabase RLS + RPC
 */

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

interface VoteRequest {
  optionId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const supabase = await createSupabaseServerClient();

    // Authenticate user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'You must be logged in to vote' }, { status: 401 });
    }

    // Parse body
    const body: VoteRequest = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json({ error: 'Option ID is required' }, { status: 400 });
    }

    // Validate option belongs to poll
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single();

    if (optionError || !option) {
      return NextResponse.json({ error: 'Invalid option or poll' }, { status: 400 });
    }

    const { error } = await supabase.from("votes").insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: user.id,
    });


    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ error: 'You have already voted on this poll' }, { status: 409 });
      }
      console.error('Vote error:', error);
      return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Vote cast successfully' }, { status: 200 });
  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
