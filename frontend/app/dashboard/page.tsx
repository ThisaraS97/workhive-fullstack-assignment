'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { api } from '@/lib/api';
import { setLoading, showToast } from '@/store/uiSlice';
import type { Application } from '@/types';

function StatusBadge({ status }: { status: Application['status'] }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard');
      return;
    }

    if (status === 'authenticated' && session?.accessToken) {
      dispatch(setLoading(true));
      api
        .getMyApplications(session.accessToken)
        .then(setApplications)
        .catch((err) =>
          dispatch(showToast({ message: err.message, type: 'error' }))
        )
        .finally(() => dispatch(setLoading(false)));
    }
  }, [status, session, router, dispatch]);

  if (status === 'loading') {
    return <p className="p-8 text-center">Loading...</p>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
      <p className="mt-2 text-slate-600">Track the status of jobs you have applied to.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Job Title</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Date Applied</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{app.job?.title}</td>
                <td className="px-4 py-3">{app.job?.employer?.name}</td>
                <td className="px-4 py-3">{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <p className="p-6 text-center text-slate-500">You have not applied to any jobs yet.</p>
        )}
      </div>
    </main>
  );
}
