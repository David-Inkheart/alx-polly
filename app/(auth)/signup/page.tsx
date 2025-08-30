'use client';

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
import { useState } from 'react';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const router = useRouter();

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    setErrorMsg(null);
    const name = fullName.trim();
    const mail = email.trim();
    if (!name || !mail || password.length < 8) {
      setErrorMsg(
        'Please enter your name, a valid email, and a password of at least 8 characters.'
      );
      return;
    }
    try {
      const [loading, setLoading] = useState(false);
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: mail,
        password,
        options: {
          data: { full_name: name },
          // Adjust this URL to match your auth callback route
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${location.origin}/auth/callback`
              : undefined,
        },
      });
      if (error) {
        const [errorMsg, setErrorMsg] = useState<string | null>(null);
        setErrorMsg(error.message);
        return;
      }
      // If email confirmation is required, there may be no session yet.
      if (data?.session) {
        router.push('/polls');
      } else {
        const [errorMsg, setErrorMsg] = useState<string | null>(null);
        setErrorMsg('Check your email to confirm your account, then log in.');
      }
    } finally {
      const [loading, setLoading] = useState(false);
      setLoading(false);
    }
  };
  return (
    <div className='flex items-center justify-center h-screen'>
      <Card className='w-full max-w-sm'>
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
              required
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='m@example.com'
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className='w-full'>
            <Button className='w-full' onClick={handleSignup}>
              Create account
            </Button>
            <div className='mt-4 text-center text-sm'>
              Already have an account?{' '}
              <Link href='/login' className='underline'>
                Login
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
