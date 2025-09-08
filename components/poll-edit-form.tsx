/**
 * Client component for editing poll questions and options with data protection
 *
 * What it does: Provides form interface for poll modifications with voting safeguards
 * Why it exists:
 * - Enables poll creators to modify their polls safely
 * - Prevents option changes after voting has started (data protection)
 * - Allows question edits even after voting (non-destructive)
 * - Provides clear UI feedback about edit restrictions
 * - Implements form validation and error handling
 * - Shows vote counts to inform editing decisions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePoll } from '@/lib/actions/polls';

/**
 * Zod validation schema for poll editing
 * Why these validations:
 * - Question length: Ensures meaningful poll questions
 * - Option requirements: Minimum 2 options for valid polls
 * - Unique options: Prevents confusing duplicate choices
 * - Non-empty options: Maintains poll integrity
 */
const pollSchema = z.object({
  question: z.string().trim().min(5, 'Question must be at least 5 characters'),
  options: z
    .array(z.string().trim().min(1, 'Option cannot be empty'))
    .min(2, 'At least 2 options required')
    .refine(
      (opts) => new Set(opts.map((s) => s.toLowerCase())).size === opts.length,
      { message: 'Options must be unique' }
    ),
});

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

interface PollEditFormProps {
  poll: Poll;
}

/**
 * Form component for editing existing polls with voting protection
 *
 * Why conditional editing:
 * - Question always editable (safe, doesn't affect vote integrity)
 * - Options locked after voting (prevents data corruption)
 * - Clear visual feedback about restrictions
 * - Preserves voting history and statistics
 */
function PollEditForm({ poll }: PollEditFormProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      question: poll.question,
      options: poll.poll_options.map((option) => option.text),
    },
  });

  const onSubmit = async (data: z.infer<typeof pollSchema>) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      const formData = new FormData();
      formData.append('question', data.question);
      data.options.forEach((option) => {
        formData.append('options', option);
      });

      const result = await updatePoll(poll.id, formData);

      if (result.success) {
        setSuccessMessage(result.message || 'Poll updated successfully!');

        // Redirect to polls page after a short delay
        setTimeout(() => {
          router.push('/polls');
        }, 1500);
      } else {
        setErrorMessage(result.message || 'Failed to update poll.');
        return;
      }
    } catch (error) {
      console.error('Poll update error:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.'
      );
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <div className='w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>Edit Poll</h1>

        {successMessage && (
          <div className='mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md'>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md'>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='question'>Poll Question</Label>
            <Input
              id='question'
              {...register('question')}
              placeholder="What's your favorite framework?"
            />
            {errors.question && (
              <p className='text-sm text-red-500'>{errors.question.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label>Options</Label>
            {poll.poll_options.map((option, index) => (
              <div key={option.id} className='space-y-1'>
                <Input
                  {...register(`options.${index}` as const)}
                  placeholder={`Option ${index + 1}`}
                  defaultValue={option.text}
                  disabled={poll.total_votes > 0}
                  className={
                    poll.total_votes > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
                  }
                />
                {errors.options?.[index] && (
                  <p className='text-sm text-red-500'>
                    {errors.options[index]?.message}
                  </p>
                )}
                {option.votes_count > 0 && (
                  <p className='text-xs text-muted-foreground'>
                    {option.votes_count} votes already cast for this option
                  </p>
                )}
                {poll.total_votes > 0 && (
                  <p className='text-xs text-amber-600'>
                    🔒 Option locked due to existing votes
                  </p>
                )}
              </div>
            ))}
            {errors.options?.message && (
              <p className='text-sm text-red-500'>{errors.options.message}</p>
            )}
          </div>

          <div className='flex gap-2'>
            <Button type='submit' disabled={isSubmitting} className='flex-1'>
              {isSubmitting ? 'Updating Poll...' : 'Update Poll'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/polls')}
              className='flex-1'
            >
              Cancel
            </Button>
          </div>
        </form>

        <div
          className={`mt-6 p-4 border rounded-md ${
            poll.total_votes > 0
              ? 'bg-amber-50 border-amber-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <h3 className='text-sm font-medium mb-2'>
            {poll.total_votes > 0
              ? '🔒 Edit Restrictions'
              : '✅ Full Editing Available'}
          </h3>
          <p className='text-xs'>
            {poll.total_votes > 0 ? (
              <span className='text-amber-700'>
                This poll has{' '}
                <strong>
                  {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
                </strong>{' '}
                already. You can only edit the question. Options cannot be
                changed to preserve voting data.
              </span>
            ) : (
              <span className='text-green-700'>
                No votes have been cast yet. You can edit both the question and
                options freely.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PollEditForm;
