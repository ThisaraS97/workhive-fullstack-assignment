'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { applyAction } from '@/actions/jobs';
import { api } from '@/lib/api';
import { setLoading, showToast } from '@/store/uiSlice';
import { FileUpload, FormAlert, PageHeader, TextArea } from '@/components/ui/Form';
import { LoadingState } from '@/components/ui/Common';

export default function ApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ jobId: string }>();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const jobId = params.jobId;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/login?callbackUrl=/apply/${jobId}`);
    }
  }, [status, router, jobId]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken || !jobId) {
      if (status !== 'loading') setCheckingApplication(false);
      return;
    }

    let cancelled = false;

    api
      .getMyApplications(session.accessToken)
      .then((applications) => {
        if (cancelled) return;
        if (applications.some((app) => app.jobId === jobId)) {
          setAlreadyApplied(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCheckingApplication(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, session, jobId]);

  function finishApplication(message: string, toastType: 'success' | 'info' = 'success') {
    dispatch(showToast({ message, type: toastType }));
    router.replace('/dashboard');
  }

  async function handleSubmit(formData: FormData) {
    if (isSubmitting || alreadyApplied) return;

    setError('');
    setIsSubmitting(true);
    dispatch(setLoading(true));
    formData.set('jobId', jobId);

    try {
      const result = await applyAction(formData);

      if (result.success) {
        finishApplication('Application submitted successfully!');
        return;
      }

      if (result.code === 'ALREADY_APPLIED') {
        finishApplication('You have already applied to this job.', 'info');
        return;
      }

      setError(result.error || 'Application failed');
      dispatch(showToast({ message: result.error || 'Application failed', type: 'error' }));
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  }

  if (status === 'loading' || checkingApplication) {
    return <LoadingState />;
  }

  if (alreadyApplied) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <PageHeader
          badge="Job application"
          title="Already applied"
          subtitle="You have already submitted an application for this role."
        />

        <div className="wh-card space-y-6 text-center">
          <p className="text-[15px] leading-relaxed text-slate-600">
            Track your application status anytime from your dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className="wh-btn-primary">
              View my applications
            </Link>
            <Link href="/" className="wh-btn-secondary">
              Browse more jobs
            </Link>
          </div>
        </div>
      </main>
    );
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
          disabled={isSubmitting}
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
          <button type="submit" className="wh-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit application'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="wh-btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
