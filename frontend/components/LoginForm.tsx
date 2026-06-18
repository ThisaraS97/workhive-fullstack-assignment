'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/uiSlice';
import { PageHeader, TextInput } from '@/components/ui/Form';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      dispatch(showToast({ message: 'Invalid email or password', type: 'error' }));
      return;
    }

    dispatch(showToast({ message: 'Welcome back!', type: 'success' }));
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-12 md:py-16">
      <PageHeader
        title="Welcome back"
        subtitle={
          <>
            New here?{' '}
            <Link href="/auth/register" className="font-semibold text-blue-600 hover:underline">
              Create an account
            </Link>
          </>
        }
      />

      <form onSubmit={handleSubmit} className="wh-card space-y-5">
        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && !email ? 'Email is required' : ''}
          placeholder="you@company.com"
        />
        <TextInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          placeholder="Enter your password"
        />

        <button type="submit" className="wh-btn-primary w-full">
          Sign in
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">Demo: seeker1@example.com / Password123!</p>
    </main>
  );
}
