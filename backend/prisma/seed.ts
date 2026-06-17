import { PrismaClient, Role, JobStatus, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const employers = [
  { name: 'Alice Chen', email: 'alice@techcorp.io' },
  { name: 'Bob Martinez', email: 'bob@startuphub.com' },
  { name: 'Carol Nguyen', email: 'carol@designstudio.co' },
  { name: 'David Kim', email: 'david@fintechlabs.io' },
  { name: 'Eva Patel', email: 'eva@healthtech.com' },
];

const seekers = Array.from({ length: 15 }, (_, i) => ({
  name: `Seeker ${i + 1}`,
  email: `seeker${i + 1}@example.com`,
}));

const categories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations'];
const locations = ['Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'London, UK'];

const jobTemplates = [
  { title: 'Senior Full Stack Engineer', category: 'Engineering', salaryMin: 120000, salaryMax: 160000 },
  { title: 'Frontend Developer', category: 'Engineering', salaryMin: 90000, salaryMax: 130000 },
  { title: 'Backend Node.js Developer', category: 'Engineering', salaryMin: 100000, salaryMax: 140000 },
  { title: 'UX Designer', category: 'Design', salaryMin: 80000, salaryMax: 110000 },
  { title: 'Product Designer', category: 'Design', salaryMin: 85000, salaryMax: 120000 },
  { title: 'Growth Marketing Manager', category: 'Marketing', salaryMin: 70000, salaryMax: 95000 },
  { title: 'Content Marketing Specialist', category: 'Marketing', salaryMin: 55000, salaryMax: 75000 },
  { title: 'Account Executive', category: 'Sales', salaryMin: 65000, salaryMax: 90000 },
  { title: 'Sales Development Rep', category: 'Sales', salaryMin: 50000, salaryMax: 70000 },
  { title: 'DevOps Engineer', category: 'Engineering', salaryMin: 110000, salaryMax: 150000 },
  { title: 'Data Analyst', category: 'Operations', salaryMin: 70000, salaryMax: 95000 },
  { title: 'Operations Manager', category: 'Operations', salaryMin: 75000, salaryMax: 100000 },
  { title: 'Mobile Developer (React Native)', category: 'Engineering', salaryMin: 95000, salaryMax: 135000 },
  { title: 'QA Engineer', category: 'Engineering', salaryMin: 80000, salaryMax: 110000 },
  { title: 'Brand Designer', category: 'Design', salaryMin: 60000, salaryMax: 85000 },
  { title: 'SEO Specialist', category: 'Marketing', salaryMin: 55000, salaryMax: 78000 },
  { title: 'Customer Success Manager', category: 'Sales', salaryMin: 60000, salaryMax: 85000 },
  { title: 'Project Coordinator', category: 'Operations', salaryMin: 50000, salaryMax: 65000 },
  { title: 'Cloud Architect', category: 'Engineering', salaryMin: 140000, salaryMax: 180000 },
  { title: 'Technical Writer', category: 'Operations', salaryMin: 65000, salaryMax: 90000 },
];

async function main() {
  console.log('Seeding WorkHive database...');

  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: 'admin@workhive.local',
      passwordHash,
      role: Role.admin,
    },
  });

  const employerUsers = await Promise.all(
    employers.map((e) =>
      prisma.user.create({
        data: { ...e, passwordHash, role: Role.employer },
      })
    )
  );

  const seekerUsers = await Promise.all(
    seekers.map((s) =>
      prisma.user.create({
        data: { ...s, passwordHash, role: Role.seeker },
      })
    )
  );

  const jobs = await Promise.all(
    jobTemplates.map((template, index) => {
      const employer = employerUsers[index % employerUsers.length];
      const location = locations[index % locations.length];
      return prisma.job.create({
        data: {
          employerId: employer.id,
          title: template.title,
          description: `${template.title} at ${employer.name.split(' ')[1] || 'Company'}. Join our team to build impactful products. Requirements include relevant experience, strong communication, and passion for innovation.`,
          location,
          category: template.category,
          salaryMin: template.salaryMin,
          salaryMax: template.salaryMax,
          status: index === 18 ? JobStatus.flagged : JobStatus.active,
        },
      });
    })
  );

  const statuses: ApplicationStatus[] = [
    ApplicationStatus.pending,
    ApplicationStatus.accepted,
    ApplicationStatus.rejected,
  ];

  const applications = [];
  for (let i = 0; i < 30; i++) {
    const job = jobs[i % jobs.length];
    const seeker = seekerUsers[i % seekerUsers.length];
    const status = statuses[i % statuses.length];

    try {
      const app = await prisma.application.create({
        data: {
          jobId: job.id,
          userId: seeker.id,
          coverLetter: `I am excited to apply for ${job.title}. My background aligns well with your requirements.`,
          resumeUrl: `/uploads/resumes/sample-${(i % 5) + 1}.pdf`,
          status,
        },
      });
      applications.push(app);
    } catch {
      // skip duplicate job+user pairs
    }
  }

  console.log(`Seeded: 1 admin, ${employerUsers.length} employers, ${seekerUsers.length} seekers`);
  console.log(`Seeded: ${jobs.length} jobs, ${applications.length} applications`);
  console.log('Test credentials — all users: Password123!');
  console.log('Admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
