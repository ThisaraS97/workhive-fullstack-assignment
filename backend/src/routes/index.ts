import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Role } from '@prisma/client';
import { config } from '../config';
import { authMiddleware, rbacMiddleware, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  createJobSchema,
  updateJobSchema,
  applySchema,
  updateApplicantStatusSchema,
  jobFilterSchema,
} from '../validators/schemas';
import {
  AuthController,
  JobController,
  ApplicationController,
  AdminController,
  ResumeController,
} from '../controllers';
import { AppError } from '../utils/AppError';

const authController = new AuthController();
const jobController = new JobController();
const applicationController = new ApplicationController();
const adminController = new AdminController();
const resumeController = new ResumeController();

const resumeDir = path.join(process.cwd(), config.uploadDir, 'resumes');
fs.mkdirSync(resumeDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new AppError('Only PDF files are allowed', 400, 'INVALID_FILE_TYPE') as unknown as null, false);
    }
    cb(null, true);
  },
});

export const apiRouter = Router();

apiRouter.post('/auth/register', validateBody(registerSchema), authController.register);
apiRouter.post('/auth/login', validateBody(loginSchema), authController.login);

apiRouter.get('/jobs', validateQuery(jobFilterSchema), optionalAuth, jobController.list);
apiRouter.get('/jobs/mine', authMiddleware, rbacMiddleware(Role.employer), jobController.myJobs);
apiRouter.get('/jobs/:id', jobController.getById);
apiRouter.post('/jobs', authMiddleware, rbacMiddleware(Role.employer), validateBody(createJobSchema), jobController.create);
apiRouter.patch('/jobs/:id', authMiddleware, rbacMiddleware(Role.employer), validateBody(updateJobSchema), jobController.update);
apiRouter.get('/jobs/:id/applicants', authMiddleware, rbacMiddleware(Role.employer), applicationController.getApplicants);

apiRouter.post('/applications', authMiddleware, rbacMiddleware(Role.seeker), validateBody(applySchema), applicationController.apply);
apiRouter.get('/applications/mine', authMiddleware, rbacMiddleware(Role.seeker), applicationController.mine);
apiRouter.patch(
  '/applications/:id/status',
  authMiddleware,
  rbacMiddleware(Role.employer),
  validateBody(updateApplicantStatusSchema),
  applicationController.updateStatus
);

apiRouter.post(
  '/resume/upload',
  authMiddleware,
  rbacMiddleware(Role.seeker),
  upload.single('resume'),
  resumeController.upload
);

apiRouter.get('/admin/jobs', authMiddleware, rbacMiddleware(Role.admin), adminController.listAllJobs);
apiRouter.patch('/admin/jobs/:id/flag', authMiddleware, rbacMiddleware(Role.admin), adminController.flagJob);
apiRouter.delete('/admin/jobs/:id', authMiddleware, rbacMiddleware(Role.admin), adminController.removeJob);
