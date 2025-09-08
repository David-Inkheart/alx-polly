/**
 * Client component for displaying detailed poll view with voting functionality
 *
 * What it does: Shows poll details, handles voting, and displays results
 * Why it exists:
 * - Provides interactive voting experience for authenticated users
 * - Shows real-time vote counts and percentages
 * - Prevents multiple votes from same user
 * - Handles both voting and results viewing states
 * - Implements optimistic updates for immediate feedback
 * - Manages authentication state for vote eligibility
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { VoteResult } from './vote-result';

/**
 * Poll option data structure with vote count
 */
interface PollOption {
  id: string;
  text: string;
  votes_count: number;
}

/**
 * Complete poll data structure with metadata and options
 */
interface Poll {
  id: string;
  question: string;
  created_at: string;
  total_votes: number;
  created_by: string;
  poll_options: PollOption[];
}

/**
 * Props for the PollDetailClient component
 */
interface PollDetailClientProps {
  poll: Poll;
}

/**
 * Main component for displaying poll details and handling voting
 *
 * Why client-side:
 * - Needs to track voting state and user authentication
 * - Handles real-time vote count updates
 * - Manages different UI states (voting vs. results)
 * - Implements optimistic UI updates for voting
 */
export default function PollDetailClient({
  poll: initialPoll,
}: PollDetailClientProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const checkUserVote = async () => {
      const supabase = createSupabaseBrowserClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (user) {
        // Check if user has already voted
        const { data: existingVote, error: voteError } = await supabase
          .from('votes')
          .select('option_id')
          .eq('poll_id', poll.id)
          .eq('user_id', user.id)
          .single();

        if (voteError && voteError.code !== 'PGRST116') {
          console.error('Error checking existing vote:', voteError);
          return;
        }

        if (existingVote) {
          setHasVoted(true);
          setSelectedOption(existingVote.option_id);
        }
      }
    };

    checkUserVote();
  }, [poll.id]);

  /**
   * Handles vote submission with optimistic UI updates
   *
   * Why optimistic updates:
   * - Immediately shows vote in UI for instant feedback
   * - Prevents multiple submissions while processing
   * - Provides better perceived performance
   * - Reverts on error to maintain data consistency
   *
   * Why client-side validation:
   * - Prevents unnecessary API calls for invalid states
   * - Provides immediate feedback for user errors
   */
  const handleVote = async () => {
    // CLIENT VALIDATION: Prevent invalid vote attempts
    if (!selectedOption || hasVoted || !currentUserId) return;

    setIsVoting(true);
    setError('');

    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cast vote');
      }

      // Refresh the poll data
      const pollResponse = await fetch(`/api/polls/${poll.id}`);
      if (!pollResponse.ok) {
        throw new Error('Failed to refresh poll data');
      }
      const updatedPoll = await pollResponse.json();
      setPoll(updatedPoll);
      setHasVoted(true);
    } catch (error) {
      console.error('Vote error:', error);
      setError(error instanceof Error ? error.message : 'Failed to cast vote');
    } finally {
      setIsVoting(false);
    }
  };

  const isOwner = currentUserId === poll.created_by;

  return (
    <div className='max-w-4xl mx-auto p-4 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <Button variant='outline' onClick={() => router.push('/polls')}>
          ← Back to Polls
        </Button>
        {isOwner && (
          <Button
            variant='outline'
            onClick={() => router.push(`/polls/${poll.id}/edit`)}
          >
            Edit Poll
          </Button>
        )}
      </div>

      {/* Poll Question */}
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>{poll.question}</CardTitle>
          <p className='text-sm text-muted-foreground'>
            {poll.total_votes} total votes • Created{' '}
            {new Date(poll.created_at).toLocaleDateString()}
          </p>
        </CardHeader>
      </Card>

      {/* Voting Section */}
      {!hasVoted && currentUserId ? (
        <Card>
          <CardHeader>
            <CardTitle>Cast Your Vote</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {error && (
              <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-md'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              {poll.poll_options.map((option) => (
                <div key={option.id} className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    id={option.id}
                    name='vote'
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className='w-4 h-4 text-blue-600'
                  />
                  <label
                    htmlFor={option.id}
                    className='flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50'
                  >
                    {option.text}
                  </label>
                </div>
              ))}
            </div>

            <Button
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              className='w-full'
            >
              {isVoting ? 'Casting Vote...' : 'Cast Vote'}
            </Button>
          </CardContent>
        </Card>
      ) : !currentUserId ? (
        <Card>
          <CardContent className='text-center py-8'>
            <p className='text-muted-foreground mb-4'>
              Please log in to vote on this poll.
            </p>
            <Button onClick={() => router.push('/login')}>Log In</Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Results */}
      {(hasVoted || !currentUserId) && (
        <VoteResult
          question={poll.question}
          options={poll.poll_options.map((option) => ({
            text: option.text,
            votes: option.votes_count,
          }))}
          totalVotes={poll.total_votes}
        />
      )}

      {/* Your Vote Indicator */}
      {hasVoted && (
        <Card>
          <CardContent className='text-center py-4'>
            <p className='text-green-600 font-medium'>
              ✅ You have voted on this poll
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
