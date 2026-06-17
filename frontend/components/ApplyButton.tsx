'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ApplyButton({ jobId }: { jobId: string }) {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Link
        href={`/auth/login?callbackUrl=/apply/${jobId}`}
        className="inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Login to Apply
      </Link>
    );
  }

  if (session.user.role !== 'seeker') {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
        Only job seekers can apply to jobs.
      </p>
    );
  }

  return (
    <Link
      href={`/apply/${jobId}`}
      className="inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
    >
      Apply Now
    </Link>
  );
}
