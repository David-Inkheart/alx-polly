'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const pollSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .min(2, 'At least 2 options required'),
});

export default function PollForm({
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
}: {
  onSubmit: (data: z.infer<typeof pollSchema>) => void;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    setError,
    control,
  } = useForm({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      question: '',
      options: ['', ''],
    },
  });

  return (
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
        {[0, 1].map((index) => (
          <div key={index} className='space-y-1'>
            <Input
              {...register(`options.${index}` as const)}
              placeholder={`Option ${index + 1}`}
            />
            {errors.options?.[index] && (
              <p className='text-sm text-red-500'>
                {errors.options[index]?.message}
              </p>
            )}
          </div>
        ))}
        {errors.options?.message && (
          <p className='text-sm text-red-500'>{errors.options.message}</p>
        )}
      </div>

      <Button
        type='submit'
        disabled={externalIsSubmitting || formIsSubmitting}
        className='w-full'
      >
        {externalIsSubmitting || formIsSubmitting
          ? 'Creating Poll...'
          : 'Create Poll'}
      </Button>
    </form>
  );
}
