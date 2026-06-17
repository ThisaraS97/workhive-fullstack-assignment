import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config';
import { AppError, assertFound } from '../utils/AppError';
import { UserRepository, JobRepository, ApplicationRepository } from '../repositories';
import { prisma } from '../config/database';
import { spawnEmailWorker } from '../workers/emailWorker';
import { spawnResumeParserWorker } from '../workers/resumeParserWorker';

const userRepo = new UserRepository();
const jobRepo = new JobRepository();
const applicationRepo = new ApplicationRepository();

export class AuthService {
  async register(input: { name: string; email: string; password: string; role: Role }) {
    if (input.role === Role.admin) {
      throw new AppError('Admin accounts cannot be self-registered', 403, 'FORBIDDEN');
    }

    const existing = await userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    const accessToken = this.signToken(user.id, user.role);
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken };
  }

  async login(input: { email: string; password: string }) {
    const user = await userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = this.signToken(user.id, user.role);
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken };
  }

  signToken(userId: string, role: Role) {
    return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: '7d' });
  }
}

export class JobService {
  async listJobs(filters: {
    location?: string;
    category?: string;
    salaryMin?: number;
    keyword?: string;
    employerId?: string;
    includeAllStatuses?: boolean;
  }) {
    return jobRepo.findMany(filters);
  }

  async getJob(id: string) {
    const job = await jobRepo.findById(id);
    return assertFound(job, 'Job not found', 'JOB_NOT_FOUND');
  }

  async createJob(
    employerId: string,
    data: {
      title: string;
      description: string;
      location: string;
      category: string;
      salaryMin: number;
      salaryMax: number;
    }
  ) {
    if (data.salaryMin > data.salaryMax) {
      throw new AppError('Minimum salary cannot exceed maximum salary', 400, 'INVALID_SALARY_RANGE');
    }
    return jobRepo.create({ ...data, employerId });
  }

  async updateJob(
    employerId: string,
    jobId: string,
    data: Partial<{
      title: string;
      description: string;
      location: string;
      category: string;
      salaryMin: number;
      salaryMax: number;
      status: 'active' | 'removed';
    }>
  ) {
    const job = await this.getJob(jobId);
    if (job.employerId !== employerId) {
      throw new AppError('You do not own this job posting', 403, 'FORBIDDEN');
    }
    return jobRepo.update(jobId, data);
  }

  async flagJob(jobId: string) {
    await this.getJob(jobId);
    return jobRepo.flag(jobId);
  }

  async removeJob(jobId: string) {
    await this.getJob(jobId);
    return jobRepo.delete(jobId);
  }
}

export class ApplicationService {
  async apply(
    userId: string,
    data: { jobId: string; coverLetter: string; resumeUrl: string; seekerEmail: string; seekerName: string; jobTitle: string }
  ) {
    const job = assertFound(await jobRepo.findById(data.jobId), 'Job not found', 'JOB_NOT_FOUND');

    if (job.status !== 'active') {
      throw new AppError('This job is no longer accepting applications', 400, 'JOB_NOT_ACTIVE');
    }

    const existing = await applicationRepo.findByJobAndUser(data.jobId, userId);
    if (existing) {
      throw new AppError('You have already applied to this job', 409, 'ALREADY_APPLIED');
    }

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId: data.jobId,
          userId,
          coverLetter: data.coverLetter,
          resumeUrl: data.resumeUrl,
        },
        include: {
          job: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return app;
    });

    spawnEmailWorker({
      to: data.seekerEmail,
      subject: `Application received: ${data.jobTitle}`,
      text: `Hi ${data.seekerName},\n\nYour application for "${data.jobTitle}" has been received. We'll notify you when the employer updates your status.\n\n— WorkHive`,
    });

    spawnResumeParserWorker({
      applicationId: application.id,
      resumePath: data.resumeUrl,
    });

    return application;
  }

  async getMyApplications(userId: string) {
    return applicationRepo.findByUser(userId);
  }

  async getApplicantsForJob(employerId: string, jobId: string) {
    const job = await jobRepo.findById(jobId);
    const found = assertFound(job, 'Job not found', 'JOB_NOT_FOUND');
    if (found.employerId !== employerId) {
      throw new AppError('You do not own this job posting', 403, 'FORBIDDEN');
    }
    return applicationRepo.findByJob(jobId);
  }

  async updateApplicantStatus(employerId: string, applicationId: string, status: 'accepted' | 'rejected') {
    const application = await applicationRepo.findById(applicationId);
    const found = assertFound(application, 'Application not found', 'APPLICATION_NOT_FOUND');

    if (found.job.employerId !== employerId) {
      throw new AppError('You do not own this job posting', 403, 'FORBIDDEN');
    }

    return applicationRepo.updateStatus(applicationId, status);
  }
}
