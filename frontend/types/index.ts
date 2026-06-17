export type Role = 'seeker' | 'employer' | 'admin';

export type JobStatus = 'active' | 'flagged' | 'removed';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  salaryMin: number;
  salaryMax: number;
  status: JobStatus;
  createdAt: string;
  employer: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  coverLetter: string;
  resumeUrl: string;
  appliedAt: string;
  job?: Job & { employer?: { id: string; name: string } };
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export interface JobFilters {
  location?: string;
  category?: string;
  salaryMin?: number;
  keyword?: string;
}
