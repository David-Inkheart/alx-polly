'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { deletePoll } from '@/lib/actions/polls';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Trash2, Edit } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes_count: number;
}

interface Poll {
  id: string;
  question: string;
  created_at: string;
  total_votes: number;
  created_by: string;
  poll_options: PollOption[];
}

interface PollsClientProps {
  initialPolls: Poll[];
  error?: string;
}

export default function PollsClient({ initialPolls, error }: PollsClientProps) {
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    getCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      router.push('/');
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this poll? This action cannot be undone.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deletePoll(pollId);
      // Remove poll from local state
      setPolls((prev) => prev.filter((poll) => poll.id !== pollId));
      // router.refresh(); // optional if server state must sync
    } catch (err) {
      console.error('Failed to delete poll:', err);
      alert('Failed to delete poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <div className='text-center py-8'>
          <p className='text-red-500 mb-4'>{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Polls Dashboard</h1>
        <div className='flex gap-2'>
          <Button asChild variant='outline'>
            <Link href='/polls/create'>Create New Poll</Link>
          </Button>
          <Button onClick={handleLogout} variant='outline'>
            Logout
          </Button>
        </div>
      </div>

      {polls.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground mb-4'>No polls found.</p>
          <Button asChild>
            <Link href='/polls/create'>Create Your First Poll</Link>
          </Button>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {polls.map((poll) => {
            const isOwner = currentUserId === poll.created_by;

            return (
              <Card key={poll.id} className='hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <CardTitle className='text-lg leading-tight pr-2'>
                      {poll.question}
                    </CardTitle>
                    {isOwner && (
                      <div className='flex gap-1 flex-shrink-0'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => router.push(`/polls/${poll.id}/edit`)}
                          className='h-8 w-8 p-0'
                          aria-label='Edit poll'
                          title='Edit poll'
                        >
                          <Edit className='h-4 w-4' aria-hidden='true' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeletePoll(poll.id)}
                          disabled={loading}
                          className='h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
                          aria-label='Delete poll'
                          title='Delete poll'
                        >
                          <Trash2 className='h-4 w-4' aria-hidden='true' />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p className='text-sm text-muted-foreground'>
                      {poll.total_votes} total votes
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Created {formatDate(poll.created_at)}
                    </p>
                    <div className='pt-2'>
                      <Link href={`/polls/${poll.id}`}>
                        <Button variant='outline' size='sm' className='w-full'>
                          View Poll
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
