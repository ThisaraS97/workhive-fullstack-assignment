import type { ApiResponse, Job, Application, JobFilters, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_URL}/api/v1${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string; params?: Record<string, string | number | undefined> } = {}
): Promise<T> {
  const { token, params, ...init } = options;
  const headers = new Headers(init.headers);

  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (API_URL.includes('ngrok')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, params), { ...init, headers, cache: 'no-store' });
  } catch {
    throw new ApiError(
      'Unable to reach the API. Make sure the backend and ngrok tunnel are running.',
      'API_UNREACHABLE'
    );
  }

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      'Unable to reach the API. Make sure the backend and ngrok tunnel are running.',
      'API_UNREACHABLE'
    );
  }

  if (!json.success) {
    throw new ApiError(json.error?.message || 'Request failed', json.error?.code || 'REQUEST_FAILED');
  }

  return json.data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string; role: string }) =>
    request<{ user: User; accessToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User; accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getJobs: (filters?: JobFilters, token?: string) =>
    request<Job[]>('/jobs', { params: filters as Record<string, string | number | undefined>, token }),

  getJob: (id: string) => request<Job>(`/jobs/${id}`),

  getMyJobs: (token: string) => request<Job[]>('/jobs/mine', { token }),

  createJob: (token: string, body: Record<string, unknown>) =>
    request<Job>('/jobs', { method: 'POST', token, body: JSON.stringify(body) }),

  updateJob: (token: string, id: string, body: Record<string, unknown>) =>
    request<Job>(`/jobs/${id}`, { method: 'PATCH', token, body: JSON.stringify(body) }),

  getMyApplications: (token: string) => request<Application[]>('/applications/mine', { token }),

  getApplicants: (token: string, jobId: string) =>
    request<Application[]>(`/jobs/${jobId}/applicants`, { token }),

  apply: (token: string, body: { jobId: string; coverLetter: string; resumeUrl: string }) =>
    request<Application>('/applications', { method: 'POST', token, body: JSON.stringify(body) }),

  updateApplicantStatus: (token: string, applicationId: string, status: 'accepted' | 'rejected') =>
    request<Application>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),

  uploadResume: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return request<{ resumeUrl: string }>('/resume/upload', { method: 'POST', token, body: formData });
  },

  getAdminJobs: (token: string) => request<Job[]>('/admin/jobs', { token }),

  flagJob: (token: string, id: string) => request<Job>(`/admin/jobs/${id}/flag`, { method: 'PATCH', token }),

  removeJob: (token: string, id: string) =>
    request<{ message: string }>(`/admin/jobs/${id}`, { method: 'DELETE', token }),
};

export function resumeUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}
