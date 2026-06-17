import { Request, Response, NextFunction } from 'express';
import { AuthService, JobService, ApplicationService } from '../services';
import { UserRepository } from '../repositories';
import { AppError } from '../utils/AppError';

const authService = new AuthService();
const jobService = new JobService();
const applicationService = new ApplicationService();
const userRepo = new UserRepository();

function sendSuccess(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export class JobController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeAllStatuses = req.user?.role === 'admin';
      const jobs = await jobService.listJobs({
        location: req.query.location as string | undefined,
        category: req.query.category as string | undefined,
        salaryMin: req.query.salaryMin ? Number(req.query.salaryMin) : undefined,
        keyword: req.query.keyword as string | undefined,
        employerId: req.query.employerId as string | undefined,
        includeAllStatuses,
      });
      sendSuccess(res, jobs);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.getJob(String(req.params.id));
      sendSuccess(res, job);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const job = await jobService.createJob(req.user.userId, req.body);
      sendSuccess(res, job, 201);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const job = await jobService.updateJob(req.user.userId, String(req.params.id), req.body);
      sendSuccess(res, job);
    } catch (err) {
      next(err);
    }
  };

  myJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const jobs = await jobService.listJobs({ employerId: req.user.userId, includeAllStatuses: true });
      sendSuccess(res, jobs);
    } catch (err) {
      next(err);
    }
  };
}

export class ApplicationController {
  apply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const { jobId, coverLetter, resumeUrl } = req.body;
      const job = await jobService.getJob(jobId);
      const user = await userRepo.findById(req.user.userId);
      if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

      const application = await applicationService.apply(req.user.userId, {
        jobId,
        coverLetter,
        resumeUrl,
        seekerEmail: user.email,
        seekerName: user.name,
        jobTitle: job.title,
      });

      sendSuccess(res, application, 201);
    } catch (err) {
      next(err);
    }
  };

  mine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const applications = await applicationService.getMyApplications(req.user.userId);
      sendSuccess(res, applications);
    } catch (err) {
      next(err);
    }
  };

  getApplicants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const applicants = await applicationService.getApplicantsForJob(req.user.userId, String(req.params.id));
      sendSuccess(res, applicants);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      const application = await applicationService.updateApplicantStatus(
        req.user.userId,
        String(req.params.id),
        req.body.status
      );
      sendSuccess(res, application);
    } catch (err) {
      next(err);
    }
  };
}

export class AdminController {
  flagJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.flagJob(String(req.params.id));
      sendSuccess(res, job);
    } catch (err) {
      next(err);
    }
  };

  removeJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await jobService.removeJob(String(req.params.id));
      sendSuccess(res, { message: 'Job removed successfully' });
    } catch (err) {
      next(err);
    }
  };

  listAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await jobService.listJobs({ includeAllStatuses: true });
      sendSuccess(res, jobs);
    } catch (err) {
      next(err);
    }
  };
}

export class ResumeController {
  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('PDF resume file is required', 400, 'FILE_REQUIRED');
      }
      const resumeUrl = `/uploads/resumes/${req.file.filename}`;
      sendSuccess(res, { resumeUrl, filename: req.file.filename }, 201);
    } catch (err) {
      next(err);
    }
  };
}
