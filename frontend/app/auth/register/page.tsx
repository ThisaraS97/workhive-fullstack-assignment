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
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Register</h1>
      <p className="mt-2 text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-indigo-600 hover:underline">
          Login
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} />
        <Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} error={errors.password} />

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
            I am a
          </label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="seeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>
        </div>

        <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          Create account
        </button>
      </form>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
}) {
  const id = label.toLowerCase();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm ${error ? 'border-red-400' : 'border-slate-300'}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
