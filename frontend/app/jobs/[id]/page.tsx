import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import ApplyButton from '@/components/ApplyButton';
import { BackLink } from '@/components/ui/Common';

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
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <BackLink />

      <article className="wh-card mt-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="wh-badge">{job.category}</span>
          <span className="text-sm font-medium text-slate-500">{job.location}</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{job.title}</h1>
        <p className="mt-2 text-lg text-slate-600">{job.employer.name}</p>
        <p className="mt-4 text-sm font-semibold text-slate-800">
          ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} / year
        </p>

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">About the role</h2>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">{job.description}</p>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <ApplyButton jobId={job.id} />
        </div>
      </article>
    </main>
  );
}
