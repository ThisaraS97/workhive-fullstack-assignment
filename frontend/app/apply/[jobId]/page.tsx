'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { applyAction } from '@/actions/jobs';
import { setLoading, showToast } from '@/store/uiSlice';
import { FileUpload, FormAlert, PageHeader, TextArea } from '@/components/ui/Form';
import { LoadingState } from '@/components/ui/Common';

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
    return <LoadingState />;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <PageHeader
        badge="Job application"
        title="Apply for this role"
        subtitle={`Signed in as ${session?.user?.name}. Tell the employer why you're a great fit.`}
      />

      <form action={handleSubmit} className="wh-card space-y-7">
        <TextArea
          id="coverLetter"
          name="coverLetter"
          label="Cover letter"
          hint="A few thoughtful sentences go a long way."
          required
          minLength={10}
          rows={7}
          placeholder="Share your relevant experience, what excites you about this role, and what you'd bring to the team..."
        />

        <FileUpload
          id="resume"
          name="resume"
          label="Resume"
          accept="application/pdf"
          required
        />

        {error && <FormAlert>{error}</FormAlert>}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          <button type="submit" className="wh-btn-primary">
            Submit application
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="wh-btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
