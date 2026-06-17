'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { api } from '@/lib/api';
import { flagJobAction, removeJobAction } from '@/actions/jobs';
import { setLoading, showToast } from '@/store/uiSlice';
import type { Job } from '@/types';

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

  if (status === 'loading') return <p className="p-8 text-center">Loading...</p>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin moderation</h1>
      <p className="mt-2 text-slate-600">Review all jobs and take moderation actions.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{job.title}</td>
                <td className="px-4 py-3">{job.employer.name}</td>
                <td className="px-4 py-3 capitalize">{job.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleFlag(job.id)} className="text-amber-600 hover:underline">
                      Flag
                    </button>
                    <button onClick={() => handleRemove(job.id)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
