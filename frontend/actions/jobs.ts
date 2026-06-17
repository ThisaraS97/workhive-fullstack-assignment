'use server';

import { auth } from '@/auth';
import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function applyAction(formData: FormData) {
  const session = await auth();
  if (!session?.accessToken) {
    return { success: false, error: 'You must be logged in as a job seeker to apply' };
  }

  const jobId = String(formData.get('jobId') || '');
  const coverLetter = String(formData.get('coverLetter') || '');
  const resume = formData.get('resume');

  if (!jobId || !coverLetter || !(resume instanceof File) || resume.size === 0) {
    return { success: false, error: 'All fields are required' };
  }

  if (resume.type !== 'application/pdf') {
    return { success: false, error: 'Resume must be a PDF file' };
  }

  if (resume.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Resume must be 5 MB or smaller' };
  }

  try {
    const upload = await api.uploadResume(session.accessToken, resume);
    await api.apply(session.accessToken, {
      jobId,
      coverLetter,
      resumeUrl: upload.resumeUrl,
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Application failed' };
  }
}

export async function postJobAction(formData: FormData) {
  const session = await auth();
  if (!session?.accessToken) {
    return { success: false, error: 'Authentication required' };
  }

  try {
    await api.createJob(session.accessToken, {
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      location: String(formData.get('location') || ''),
      category: String(formData.get('category') || ''),
      salaryMin: Number(formData.get('salaryMin')),
      salaryMax: Number(formData.get('salaryMax')),
    });

    revalidatePath('/employer/jobs');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to post job' };
  }
}

export async function updateApplicantAction(applicationId: string, status: 'accepted' | 'rejected') {
  const session = await auth();
  if (!session?.accessToken) {
    return { success: false, error: 'Authentication required' };
  }

  try {
    await api.updateApplicantStatus(session.accessToken, applicationId, status);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
  }
}

export async function updateJobAction(jobId: string, formData: FormData) {
  const session = await auth();
  if (!session?.accessToken) {
    return { success: false, error: 'Authentication required' };
  }

  try {
    await api.updateJob(session.accessToken, jobId, {
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      location: String(formData.get('location') || ''),
      category: String(formData.get('category') || ''),
      salaryMin: Number(formData.get('salaryMin')),
      salaryMax: Number(formData.get('salaryMax')),
      status: formData.get('status') ? String(formData.get('status')) : undefined,
    });

    revalidatePath('/employer/jobs');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
  }
}

export async function flagJobAction(jobId: string) {
  const session = await auth();
  if (!session?.accessToken) return { success: false, error: 'Authentication required' };

  try {
    await api.flagJob(session.accessToken, jobId);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Flag failed' };
  }
}

export async function removeJobAction(jobId: string) {
  const session = await auth();
  if (!session?.accessToken) return { success: false, error: 'Authentication required' };

  try {
    await api.removeJob(session.accessToken, jobId);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Remove failed' };
  }
}
