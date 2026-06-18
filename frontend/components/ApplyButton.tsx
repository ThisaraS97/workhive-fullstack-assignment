'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ApplyButton({ jobId }: { jobId: string }) {
  const { data: session } = useSession();

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

  return (
    <Link href={`/apply/${jobId}`} className="wh-btn-primary">
      Apply now
    </Link>
  );
}
