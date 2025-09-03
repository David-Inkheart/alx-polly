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
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/actions/auth';

const formSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await signIn(formData);

    if (!result.success) {
      setError('root', {
        type: 'server',
        message: result.error || 'Login failed',
      });
    }
    // If successful, signIn will redirect to /polls automatically
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <Card className='w-full max-w-sm'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className='text-2xl'>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
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
          </CardContent>
          <CardFooter>
            <div className='w-full'>
              <Button className='w-full' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
              <div className='mt-4 text-center text-sm'>
                Don't have an account?{' '}
                <Link href='/signup' className='underline'>
                  Sign up
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
