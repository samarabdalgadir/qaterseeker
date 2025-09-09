import { PrismaClient, Job, JobStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface JobFilters {
  search?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  company?: string;
}

export interface JobWithEmployer extends Job {
  employer: {
    id: string;
    name: string | null;
    employerProfile: {
      companyName: string;
    } | null;
  };
  _count: {
    applications: number;
  };
}

// Fallback jobs to be used when the database is unreachable
const FALLBACK_JOBS: JobWithEmployer[] = [
  {
    id: 'fallback-1',
    title: 'Frontend Developer',
    description:
      'Build delightful UIs with React and TailwindCSS. Work closely with product and design.',
    location: 'Doha, Qatar',
    salaryMin: 9000,
    salaryMax: 15000,
    company: 'Doha Tech',
    employerId: 'employer-fallback',
    status: JobStatus.ACTIVE,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    employer: {
      id: 'employer-fallback',
      name: 'Doha Tech',
      employerProfile: { companyName: 'Doha Tech' },
    },
    _count: { applications: 12 },
  },
  {
    id: 'fallback-2',
    title: 'Backend Engineer',
    description:
      'Design and build robust APIs with Node.js and PostgreSQL. Experience with Prisma is a plus.',
    location: 'Remote - Qatar',
    salaryMin: 10000,
    salaryMax: 17000,
    company: 'Qatar Cloud',
    employerId: 'employer-fallback-2',
    status: JobStatus.ACTIVE,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    employer: {
      id: 'employer-fallback-2',
      name: 'Qatar Cloud',
      employerProfile: { companyName: 'Qatar Cloud' },
    },
    _count: { applications: 8 },
  },
  {
    id: 'fallback-3',
    title: 'Product Designer',
    description:
      'Craft intuitive experiences and collaborate with engineers to deliver polished interfaces.',
    location: 'Lusail, Qatar',
    salaryMin: 8000,
    salaryMax: 14000,
    company: 'Gulf Design Studio',
    employerId: 'employer-fallback-3',
    status: JobStatus.ACTIVE,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
    employer: {
      id: 'employer-fallback-3',
      name: 'Gulf Design Studio',
      employerProfile: { companyName: 'Gulf Design Studio' },
    },
    _count: { applications: 4 },
  },
];

function filterFallbackJobs(
  allJobs: JobWithEmployer[],
  filters: JobFilters,
): JobWithEmployer[] {
  const searchLower = (filters.search || '').toLowerCase();
  const locationLower = (filters.location || '').toLowerCase();
  const companyLower = (filters.company || '').toLowerCase();

  return allJobs.filter((job) => {
    const matchesSearch = !filters.search
      || job.title.toLowerCase().includes(searchLower)
      || job.description.toLowerCase().includes(searchLower)
      || job.company.toLowerCase().includes(searchLower);
    const matchesLocation = !filters.location
      || job.location.toLowerCase().includes(locationLower);
    const matchesCompany = !filters.company
      || job.company.toLowerCase().includes(companyLower);
    const matchesSalaryMin =
      filters.salaryMin === undefined || (job.salaryMin ?? 0) >= filters.salaryMin;
    const matchesSalaryMax =
      filters.salaryMax === undefined || (job.salaryMax ?? Number.MAX_SAFE_INTEGER) <= filters.salaryMax;
    return (
      matchesSearch &&
      matchesLocation &&
      matchesCompany &&
      matchesSalaryMin &&
      matchesSalaryMax
    );
  });
}

// Get all active jobs with pagination and filtering
export async function getJobs(
  page: number = 1,
  limit: number = 10,
  filters: JobFilters = {}
): Promise<{ jobs: JobWithEmployer[]; total: number; totalPages: number }> {
  const offset = (page - 1) * limit;

  const where: Prisma.JobWhereInput = {
    status: JobStatus.ACTIVE,
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
    ...(filters.location && {
      location: { contains: filters.location, mode: 'insensitive' },
    }),
    ...(filters.company && {
      company: { contains: filters.company, mode: 'insensitive' },
    }),
    ...(filters.salaryMin && {
      salaryMin: { gte: filters.salaryMin },
    }),
    ...(filters.salaryMax && {
      salaryMax: { lte: filters.salaryMax },
    }),
  };

  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              employerProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs: jobs as JobWithEmployer[],
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (error) {
    console.error('Database unreachable, serving fallback jobs:', error);
    const filtered = filterFallbackJobs(FALLBACK_JOBS, filters);
    const total = filtered.length;
    const paged = filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    return {
      jobs: paged,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}

// Get a single job by ID with employer details
export async function getJobById(id: string): Promise<JobWithEmployer | null> {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            employerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
    return job as JobWithEmployer | null;
  } catch {
    const fallback = FALLBACK_JOBS.find((j) => j.id === id) || null;
    return fallback;
  }
}

// Create a new job (employer only)
export async function createJob(data: {
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  company: string;
  employerId: string;
}): Promise<Job> {
  return await prisma.job.create({
    data: {
      ...data,
      status: JobStatus.ACTIVE,
    },
  });
}

// Update a job (employer only)
export async function updateJob(
  id: string,
  employerId: string,
  data: Partial<{
    title: string;
    description: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    company: string;
    status: JobStatus;
  }>
): Promise<Job | null> {
  // Verify the job belongs to the employer
  const job = await prisma.job.findFirst({
    where: { id, employerId },
  });

  if (!job) {
    return null;
  }

  return await prisma.job.update({
    where: { id },
    data,
  });
}

// Get jobs posted by a specific employer
export async function getJobsByEmployer(employerId: string): Promise<JobWithEmployer[]> {
  try {
    const jobs = await prisma.job.findMany({
      where: { employerId },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            employerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return jobs as JobWithEmployer[];
  } catch {
    // No deterministic mapping without a real employer id; return empty list
    return [];
  }
}

// Delete a job (employer only)
export async function deleteJob(id: string, employerId: string): Promise<boolean> {
  try {
    const result = await prisma.job.deleteMany({
      where: { id, employerId },
    });
    return result.count > 0;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
}