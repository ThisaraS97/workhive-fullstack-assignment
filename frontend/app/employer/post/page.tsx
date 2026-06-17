'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { postJobAction } from '@/actions/jobs';
import { setLoading, showToast } from '@/store/uiSlice';

export default function PostJobPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setError('');
    dispatch(setLoading(true));
    const result = await postJobAction(formData);
    dispatch(setLoading(false));

    if (result.success) {
      dispatch(showToast({ message: 'Job posted successfully!', type: 'success' }));
      router.push('/employer/jobs');
    } else {
      setError(result.error || 'Failed to post job');
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Post a new job</h1>

      <form action={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <Field label="Title" name="title" required />
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea id="description" name="description" required rows={5} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <Field label="Location" name="location" required />
        <Field label="Category" name="category" required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Min salary" name="salaryMin" type="number" required />
          <Field label="Max salary" name="salaryMax" type="number" required />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          Publish Job
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
