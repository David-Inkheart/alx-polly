'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className='flex items-center justify-center h-screen'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-xl text-red-600'>
            Authentication Error
          </CardTitle>
          <CardDescription>
            Something went wrong during authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-sm text-gray-600'>
            <strong>Error:</strong> {error.message}
          </div>
          <div className='flex gap-2'>
            <Button onClick={reset} className='flex-1'>
              Try Again
            </Button>
            <Button
              variant='outline'
              onClick={() => router.push('/')}
              className='flex-1'
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
