'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { signUp } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function SignupPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('fullName', data.fullName);

      const result = await signUp(formData);

      if (result?.success) {
        setSuccessMessage(result.message || 'Account created successfully');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('root', {
        type: 'server',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <Card className='w-full max-w-sm'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className='text-2xl'>Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='fullname'>Full Name</Label>
              <Input
                id='fullname'
                placeholder='John Doe'
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className='text-sm text-red-500'>
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='m@example.com'
                {...register('email')}
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email.message}</p>
              )}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' {...register('password')} />
              {errors.password && (
                <p className='text-sm text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>
            {errors.root && (
              <p className='text-sm text-red-500'>{errors.root.message}</p>
            )}
            {successMessage && (
              <p className='text-sm text-green-500'>{successMessage}</p>
            )}
          </CardContent>
          <CardFooter>
            <div className='w-full'>
              <Button className='w-full' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
              <div className='mt-4 text-center text-sm'>
                Already have an account?{' '}
                <Link href='/login' className='underline'>
                  Login
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
