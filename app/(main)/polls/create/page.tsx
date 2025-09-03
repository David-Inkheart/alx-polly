'use client';

import PollForm from '@/components/poll-form';
import { createPoll } from '@/lib/actions/polls';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const pollSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .min(2, 'At least 2 options required'),
});

export default function CreatePollPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const handleSubmit = async (data: z.infer<typeof pollSchema>) => {
    try {
      setIsCreating(true);
      setErrorMessage('');
      setSuccessMessage('');

      const formData = new FormData();
      formData.append('question', data.question);
      data.options.forEach((option) => {
        formData.append('options', option);
      });

      const result = await createPoll(formData);

      if (result.success) {
        setSuccessMessage(result.message || 'Poll created successfully!');

        // Redirect to polls page after a short delay
        setTimeout(() => {
          router.push('/polls');
        }, 1500);
      } else {
        setErrorMessage(result.message || 'Failed to create poll.');
      }
    } catch (error) {
      console.error('Poll creation error:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <div className='w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>Create New Poll</h1>

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

        <PollForm onSubmit={handleSubmit} isSubmitting={isCreating} />
      </div>
    </div>
  );
}
