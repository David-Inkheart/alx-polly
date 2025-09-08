/**
 * API route for handling poll voting operations
 * Processes individual votes and manages vote validation
 *
 * Why this route exists:
 * - Ensures one vote per user per poll (prevents fraud)
 * - Validates poll and option relationships
 * - Provides atomic vote casting with proper error handling
 * - Maintains data integrity through database constraints
 */

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Vote request payload interface
 * Defines the expected structure of vote submission data
 */
interface VoteRequest {
  optionId: string;
}

/**
 * Handles POST requests to cast a vote on a poll option
 *
 * What it does: Processes vote submissions with comprehensive validation
 * Why it validates:
 * - Authentication: Ensures only logged-in users can vote
 * - Option verification: Confirms option belongs to the specified poll
 * - Duplicate prevention: Blocks multiple votes from same user
 * - Data integrity: Maintains consistent vote counts and relationships
 *
 * @param request - Next.js request object containing vote data
 * @param params - Route parameters containing poll ID
 * @returns Promise<NextResponse> - API response with vote result or error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract poll ID from route parameters - this identifies which poll the vote is for
    const { id: pollId } = await params;
    const supabase = await createSupabaseServerClient();

    // SECURITY: Authenticate user - voting requires login to prevent anonymous manipulation
    // Why: Ensures accountability and prevents spam/bot voting
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to vote' },
        { status: 401 }
      );
    }

    // Parse and validate request body containing the vote data
    const body: VoteRequest = await request.json();
    const { optionId } = body;

    // VALIDATION: Ensure option ID is provided - prevents malformed requests
    if (!optionId) {
      return NextResponse.json(
        { error: 'Option ID is required' },
        { status: 400 }
      );
    }

    // SECURITY: Verify option belongs to poll - prevents cross-poll voting attacks
    // Why: A malicious user could try to vote on options from different polls
    // by manipulating the optionId parameter
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id, poll_id')
      .eq('id', optionId)
      .eq('poll_id', pollId) // Critical: Ensures option belongs to this specific poll
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { error: 'Invalid option or poll' },
        { status: 400 }
      );
    }

    // FRAUD PREVENTION: Check for duplicate votes - enforces one-vote-per-user rule
    // Why: Database constraints alone aren't sufficient; this provides immediate feedback
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 409 } // Conflict status for duplicate attempts
      );
    }

    // ATOMIC OPERATION: Cast the vote in database
    // Why: Single transaction ensures vote count accuracy and prevents race conditions
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
      });

    // ERROR HANDLING: Handle database constraints and other errors
    if (voteError) {
      // Handle unique constraint violation (duplicate vote attempt)
      if ((voteError as any).code === '23505') {
        return NextResponse.json(
          { error: 'You have already voted on this poll' },
          { status: 409 }
        );
      }
      console.error('Vote error:', voteError);
      return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vote cast successfully',
    });

  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
