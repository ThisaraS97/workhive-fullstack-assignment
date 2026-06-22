'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export default function ApplyButton({ jobId }: { jobId: string }) {
  const { data: session } = useSession();
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!session?.accessToken || session.user.role !== 'seeker') {
      setChecked(true);
      return;
    }

    let cancelled = false;

    api
      .getMyApplications(session.accessToken)
      .then((applications) => {
        if (!cancelled) {
          setAlreadyApplied(applications.some((app) => app.jobId === jobId));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [session, jobId]);

  if (!session) {
    return (
      <Link href={`/auth/login?callbackUrl=/apply/${jobId}`} className="wh-btn-primary">
        Sign in to apply
      </Link>
    );
  }

  if (session.user.role !== 'seeker') {
    return (
      <div className="wh-alert-warning" role="status">
        Only job seekers can apply to jobs.
      </div>
    );
  }

  if (!checked) {
    return <div className="h-11 w-36 animate-pulse rounded-full bg-slate-100" aria-hidden="true" />;
  }

  if (alreadyApplied) {
    return (
      <div className="space-y-4">
        <div className="wh-alert-warning" role="status">
          You have already applied to this job.
        </div>
        <Link href="/dashboard" className="wh-btn-primary">
          View my applications
        </Link>
      </div>
    );
  }

  return (
    <Link href={`/apply/${jobId}`} className="wh-btn-primary">
      Apply now
    </Link>
  );
}
