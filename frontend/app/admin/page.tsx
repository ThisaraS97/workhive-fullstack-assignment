'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { api } from '@/lib/api';
import { flagJobAction, removeJobAction } from '@/actions/jobs';
import { setLoading, showToast } from '@/store/uiSlice';
import type { Job } from '@/types';
import { LoadingState, PageSection, StatusBadge } from '@/components/ui/Common';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin');
      return;
    }

    if (session?.accessToken) {
      dispatch(setLoading(true));
      api
        .getAdminJobs(session.accessToken)
        .then(setJobs)
        .catch((err) => dispatch(showToast({ message: err.message, type: 'error' })))
        .finally(() => dispatch(setLoading(false)));
    }
  }, [status, session, router, dispatch]);

  async function handleFlag(jobId: string) {
    const result = await flagJobAction(jobId);
    if (result.success) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'flagged' } : j)));
      dispatch(showToast({ message: 'Job flagged', type: 'success' }));
    }
  }

  async function handleRemove(jobId: string) {
    const result = await removeJobAction(jobId);
    if (result.success) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      dispatch(showToast({ message: 'Job removed', type: 'success' }));
    }
  }

  if (status === 'loading') return <LoadingState />;

  return (
    <PageSection
      badge="Admin"
      title="Moderation"
      subtitle="Review all jobs and take moderation actions."
    >
      <div className="wh-table-wrap">
        <table className="wh-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="font-medium text-slate-900">{job.title}</td>
                <td>{job.employer.name}</td>
                <td>
                  <StatusBadge status={job.status} />
                </td>
                <td>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleFlag(job.id)}
                      className="wh-action-link wh-action-neutral !text-amber-600 hover:!text-amber-700"
                    >
                      Flag
                    </button>
                    <button
                      onClick={() => handleRemove(job.id)}
                      className="wh-action-link wh-action-reject"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}
