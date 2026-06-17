'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { api, resumeUrl } from '@/lib/api';
import { updateApplicantAction, updateJobAction } from '@/actions/jobs';
import { setLoading, showToast } from '@/store/uiSlice';
import type { Application, Job } from '@/types';

export default function EmployerJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/employer/jobs');
      return;
    }

    if (session?.accessToken) {
      dispatch(setLoading(true));
      api
        .getMyJobs(session.accessToken)
        .then(setJobs)
        .catch((err) => dispatch(showToast({ message: err.message, type: 'error' })))
        .finally(() => dispatch(setLoading(false)));
    }
  }, [status, session, router, dispatch]);

  async function loadApplicants(jobId: string) {
    if (!session?.accessToken) return;
    setSelectedJob(jobId);
    dispatch(setLoading(true));
    try {
      const data = await api.getApplicants(session.accessToken, jobId);
      setApplicants(data);
    } catch (err) {
      dispatch(showToast({ message: err instanceof Error ? err.message : 'Failed to load applicants', type: 'error' }));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleStatus(applicationId: string, statusValue: 'accepted' | 'rejected') {
    const result = await updateApplicantAction(applicationId, statusValue);
    if (result.success) {
      dispatch(showToast({ message: `Applicant ${statusValue}`, type: 'success' }));
      if (selectedJob) loadApplicants(selectedJob);
    } else {
      dispatch(showToast({ message: result.error || 'Update failed', type: 'error' }));
    }
  }

  async function closeJob(job: Job) {
    const formData = new FormData();
    formData.set('title', job.title);
    formData.set('description', job.description);
    formData.set('location', job.location);
    formData.set('category', job.category);
    formData.set('salaryMin', String(job.salaryMin));
    formData.set('salaryMax', String(job.salaryMax));
    formData.set('status', 'removed');

    const result = await updateJobAction(job.id, formData);
    if (result.success) {
      dispatch(showToast({ message: 'Job closed', type: 'success' }));
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'removed' } : j)));
    }
  }

  if (status === 'loading') return <p className="p-8 text-center">Loading...</p>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My posted jobs</h1>
          <p className="text-slate-600">Manage listings and review applicants.</p>
        </div>
        <Link href="/employer/post" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          Post new job
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Jobs</h2>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.location} · {job.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadApplicants(job.id)} className="text-sm text-indigo-600 hover:underline">
                      Applicants
                    </button>
                    {job.status === 'active' && (
                      <button onClick={() => closeJob(job)} className="text-sm text-red-600 hover:underline">
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Applicants</h2>
          {!selectedJob && <p className="text-sm text-slate-500">Select a job to view applicants.</p>}
          {selectedJob && (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app) => (
                  <tr key={app.id} className="border-t border-slate-100">
                    <td className="py-2">{app.user?.name}</td>
                    <td className="py-2">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <a href={resumeUrl(app.resumeUrl)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          View Resume
                        </a>
                        <button onClick={() => handleStatus(app.id, 'accepted')} className="text-emerald-600 hover:underline">
                          Accept
                        </button>
                        <button onClick={() => handleStatus(app.id, 'rejected')} className="text-red-600 hover:underline">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
