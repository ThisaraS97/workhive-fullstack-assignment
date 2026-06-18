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
import { EmptyState, LoadingState, PageSection } from '@/components/ui/Common';

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

  if (status === 'loading') return <LoadingState />;

  return (
    <PageSection
      badge="Employer"
      title="My posted jobs"
      subtitle="Manage listings and review applicants."
      action={
        <Link href="/employer/post" className="wh-btn-primary">
          Post new job
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="wh-panel p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Jobs</h2>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`rounded-2xl border p-4 transition ${
                  selectedJob === job.id
                    ? 'border-blue-200 bg-blue-50/50 ring-1 ring-blue-100'
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {job.location} · <span className="capitalize">{job.status}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      onClick={() => loadApplicants(job.id)}
                      className="wh-action-link wh-action-neutral"
                    >
                      Applicants
                    </button>
                    {job.status === 'active' && (
                      <button onClick={() => closeJob(job)} className="wh-action-link wh-action-reject">
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {jobs.length === 0 && <EmptyState>No jobs posted yet.</EmptyState>}
          </div>
        </section>

        <section className="wh-panel p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Applicants</h2>
          {!selectedJob && (
            <EmptyState>Select a job to view applicants.</EmptyState>
          )}
          {selectedJob && (
            <div className="wh-table-wrap !shadow-none !ring-0">
              <table className="wh-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((app) => (
                    <tr key={app.id}>
                      <td className="font-medium text-slate-900">{app.user?.name}</td>
                      <td className="text-slate-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={resumeUrl(app.resumeUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="wh-action-link wh-action-neutral"
                          >
                            Resume
                          </a>
                          <button
                            onClick={() => handleStatus(app.id, 'accepted')}
                            className="wh-action-link wh-action-accept"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatus(app.id, 'rejected')}
                            className="wh-action-link wh-action-reject"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {applicants.length === 0 && (
                <EmptyState>No applicants for this job yet.</EmptyState>
              )}
            </div>
          )}
        </section>
      </div>
    </PageSection>
  );
}
