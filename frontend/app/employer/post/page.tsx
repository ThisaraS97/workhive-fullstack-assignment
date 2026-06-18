'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { postJobAction } from '@/actions/jobs';
import { setLoading, showToast } from '@/store/uiSlice';
import { FormAlert, PageHeader, TextArea, TextInput } from '@/components/ui/Form';

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
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <PageHeader
        badge="Employer"
        title="Post a new job"
        subtitle="Reach qualified candidates with a clear, compelling listing."
      />

      <form action={handleSubmit} className="wh-card space-y-6">
        <TextInput label="Title" name="title" required placeholder="e.g. Senior Frontend Engineer" />
        <TextArea
          id="description"
          name="description"
          label="Description"
          required
          rows={6}
          placeholder="Describe the role, responsibilities, and what makes your team great..."
        />
        <TextInput label="Location" name="location" required placeholder="e.g. San Francisco, CA or Remote" />
        <TextInput label="Category" name="category" required placeholder="e.g. Engineering" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput label="Min salary" name="salaryMin" type="number" required placeholder="90000" />
          <TextInput label="Max salary" name="salaryMax" type="number" required placeholder="140000" />
        </div>

        {error && <FormAlert>{error}</FormAlert>}

        <div className="border-t border-slate-100 pt-6">
          <button type="submit" className="wh-btn-primary">
            Publish job
          </button>
        </div>
      </form>
    </main>
  );
}
