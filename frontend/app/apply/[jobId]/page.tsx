'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { applyAction } from '@/actions/jobs';
import { setLoading, showToast } from '@/store/uiSlice';

export default function ApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ jobId: string }>();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const jobId = params.jobId;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/login?callbackUrl=/apply/${jobId}`);
    }
  }, [status, router, jobId]);

  async function handleSubmit(formData: FormData) {
    setError('');
    dispatch(setLoading(true));
    formData.set('jobId', jobId);

    const result = await applyAction(formData);
    dispatch(setLoading(false));

    if (result.success) {
      dispatch(showToast({ message: 'Application submitted successfully!', type: 'success' }));
      router.push('/dashboard');
    } else {
      setError(result.error || 'Application failed');
      dispatch(showToast({ message: result.error || 'Application failed', type: 'error' }));
    }
  }

  if (status === 'loading') {
    return <p className="p-8 text-center">Loading...</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Apply for this job</h1>
      <p className="mt-2 text-sm text-slate-600">Signed in as {session?.user?.name}</p>

      <form action={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <label htmlFor="coverLetter" className="mb-1 block text-sm font-medium text-slate-700">
            Cover letter
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            required
            minLength={10}
            rows={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Tell the employer why you are a great fit..."
          />
        </div>

        <div>
          <label htmlFor="resume" className="mb-1 block text-sm font-medium text-slate-700">
            Resume (PDF, max 5 MB)
          </label>
          <input
            id="resume"
            name="resume"
            type="file"
            accept="application/pdf"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Submit Application
        </button>
      </form>
    </main>
  );
}
