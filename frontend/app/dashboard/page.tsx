'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { api } from '@/lib/api';
import { setLoading, showToast } from '@/store/uiSlice';
import type { Application } from '@/types';
import { EmptyState, LoadingState, PageSection, StatusBadge } from '@/components/ui/Common';

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
        .catch((err) => dispatch(showToast({ message: err.message, type: 'error' })))
        .finally(() => dispatch(setLoading(false)));
    }
  }, [status, session, router, dispatch]);

  if (status === 'loading') {
    return <LoadingState />;
  }

  return (
    <PageSection
      badge="Seeker"
      title="My applications"
      subtitle="Track the status of jobs you have applied to."
      className="max-w-5xl"
    >
      <div className="wh-table-wrap">
        <table className="wh-table">
          <thead>
            <tr>
              <th>Job title</th>
              <th>Company</th>
              <th>Date applied</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="font-medium text-slate-900">{app.job?.title}</td>
                <td>{app.job?.employer?.name}</td>
                <td className="text-slate-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td>
                  <StatusBadge status={app.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <EmptyState>You have not applied to any jobs yet.</EmptyState>
        )}
      </div>
    </PageSection>
  );
}
