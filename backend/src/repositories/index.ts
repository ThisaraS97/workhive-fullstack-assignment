import { ApplicationStatus, JobStatus, Role } from '@prisma/client';
import { prisma } from '../config/database';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; passwordHash: string; name: string; role: Role }) {
    return prisma.user.create({ data });
  }
}

export class JobRepository {
  async findMany(filters: {
    location?: string;
    category?: string;
    salaryMin?: number;
    keyword?: string;
    employerId?: string;
    includeAllStatuses?: boolean;
  }) {
    const where: Record<string, unknown> = {};

    if (!filters.includeAllStatuses) {
      where.status = JobStatus.active;
    }

    if (filters.employerId) where.employerId = filters.employerId;
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
    if (filters.category) where.category = { equals: filters.category, mode: 'insensitive' };
    if (filters.salaryMin) where.salaryMax = { gte: filters.salaryMin };
    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    return prisma.job.findMany({
      where,
      include: {
        employer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        employer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async create(data: {
    employerId: string;
    title: string;
    description: string;
    location: string;
    category: string;
    salaryMin: number;
    salaryMax: number;
  }) {
    return prisma.job.create({
      data,
      include: {
        employer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, data: Partial<{ title: string; description: string; location: string; category: string; salaryMin: number; salaryMax: number; status: JobStatus }>) {
    return prisma.job.update({
      where: { id },
      data,
      include: {
        employer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.job.delete({ where: { id } });
  }

  async flag(id: string) {
    return this.update(id, { status: JobStatus.flagged });
  }
}

export class ApplicationRepository {
  async findByJobAndUser(jobId: string, userId: string) {
    return prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });
  }

  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findByUser(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            employer: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findByJob(jobId: string) {
    return prisma.application.findMany({
      where: { jobId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async create(data: {
    jobId: string;
    userId: string;
    coverLetter: string;
    resumeUrl: string;
  }) {
    return prisma.application.create({
      data,
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus) {
    return prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateParsedResume(id: string, parsedResume: string) {
    return prisma.application.update({
      where: { id },
      data: { parsedResume },
    });
  }
}
