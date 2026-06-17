import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum([Role.seeker, Role.employer, Role.admin]).default(Role.seeker),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),
  category: z.string().min(2),
  salaryMin: z.coerce.number().int().positive(),
  salaryMax: z.coerce.number().int().positive(),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['active', 'removed']).optional(),
});

export const applySchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().min(10, 'Cover letter must be at least 10 characters'),
  resumeUrl: z.string().min(1),
});

export const updateApplicantStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

export const jobFilterSchema = z.object({
  location: z.string().optional(),
  category: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  keyword: z.string().optional(),
});
