import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import ApplyButton from '@/components/ApplyButton';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let job;
  try {
    job = await api.getJob(id);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">
        ← Back to jobs
      </Link>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {job.category}
          </span>
          <span className="text-sm text-slate-500">{job.location}</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
        <p className="mt-2 text-lg text-slate-600">{job.employer.name}</p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} / year
        </p>

        <div className="prose prose-slate mt-6 max-w-none">
          <h2 className="text-lg font-semibold">About the role</h2>
          <p className="whitespace-pre-wrap text-slate-700">{job.description}</p>
        </div>

        <div className="mt-8">
          <ApplyButton jobId={job.id} />
        </div>
      </article>
    </main>
  );
}
