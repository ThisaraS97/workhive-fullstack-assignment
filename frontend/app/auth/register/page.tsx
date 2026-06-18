'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { api } from '@/lib/api';
import { setCredentials } from '@/store/authSlice';
import { showToast } from '@/store/uiSlice';
import type { Role } from '@/types';
import { FormField, PageHeader, TextInput } from '@/components/ui/Form';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker' as Role,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (form.name.length < 2) next.name = 'Name must be at least 2 characters';
    if (!form.email.includes('@')) next.email = 'Enter a valid email';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await api.register(form);
      dispatch(setCredentials({ user: result.user, token: result.accessToken }));

      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      dispatch(showToast({ message: 'Account created successfully!', type: 'success' }));
      router.push(form.role === 'employer' ? '/employer/post' : '/dashboard');
    } catch (error) {
      dispatch(showToast({ message: error instanceof Error ? error.message : 'Registration failed', type: 'error' }));
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12 md:py-16">
      <PageHeader
        title="Create your account"
        subtitle={
          <>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </>
        }
      />

      <form onSubmit={handleSubmit} className="wh-card space-y-5">
        <TextInput
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="Your full name"
        />
        <TextInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          placeholder="you@company.com"
        />
        <TextInput
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          placeholder="At least 8 characters"
        />

        <FormField label="I am a" id="role">
          <select
            id="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            className="wh-select"
          >
            <option value="seeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>
        </FormField>

        <button type="submit" className="wh-btn-primary w-full">
          Create account
        </button>
      </form>
    </main>
  );
}
