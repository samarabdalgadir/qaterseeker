import { PrismaClient, Application, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface ApplicationWithDetails extends Application {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    employer: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  applicant: {
    id: string;
    name: string | null;
    email: string;
    jobSeekerProfile: {
      bio: string | null;
      skills: string[];
      resumeUrl: string | null;
    } | null;
  };
}

// Create a new job application
export async function createApplication(data: {
  jobId: string;
  applicantId: string;
  coverLetter?: string;
}): Promise<Application | null> {
  try {
    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_applicantId: {
          jobId: data.jobId,
          applicantId: data.applicantId,
        },
      },
    });

    if (existingApplication) {
      throw new Error('Application already exists for this job');
    }

    // Verify the job exists and is active
    const job = await prisma.job.findFirst({
      where: {
        id: data.jobId,
        status: 'ACTIVE',
      },
    });

    if (!job) {
      throw new Error('Job not found or not active');
    }

    return await prisma.application.create({
      data: {
        ...data,
        status: ApplicationStatus.PENDING,
      },
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return null;
  }
}

// Get applications for a specific job (employer view)
export async function getApplicationsForJob(
  jobId: string,
  employerId: string
): Promise<ApplicationWithDetails[]> {
  // First verify the job belongs to the employer
  const job = await prisma.job.findFirst({
    where: { id: jobId, employerId },
  });

  if (!job) {
    return [];
  }

  const applications = await prisma.application.findMany({
    where: { jobId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          employer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobSeekerProfile: {
            select: {
              bio: true,
              skills: true,
              resumeUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return applications as ApplicationWithDetails[];
}

// Get applications submitted by a specific job seeker
export async function getApplicationsByJobSeeker(
  applicantId: string
): Promise<ApplicationWithDetails[]> {
  const applications = await prisma.application.findMany({
    where: { applicantId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          employer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobSeekerProfile: {
            select: {
              bio: true,
              skills: true,
              resumeUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return applications as ApplicationWithDetails[];
}

// Get a specific application by ID
export async function getApplicationById(
  id: string,
  userId: string
): Promise<ApplicationWithDetails | null> {
  const application = await prisma.application.findFirst({
    where: {
      id,
      OR: [
        { applicantId: userId }, // Job seeker can view their own application
        { job: { employerId: userId } }, // Employer can view applications for their jobs
      ],
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          employer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobSeekerProfile: {
            select: {
              bio: true,
              skills: true,
              resumeUrl: true,
            },
          },
        },
      },
    },
  });

  return application as ApplicationWithDetails | null;
}

// Update application status (employer only)
export async function updateApplicationStatus(
  id: string,
  employerId: string,
  status: ApplicationStatus
): Promise<Application | null> {
  try {
    // Verify the application belongs to a job owned by the employer
    const application = await prisma.application.findFirst({
      where: {
        id,
        job: { employerId },
      },
    });

    if (!application) {
      return null;
    }

    return await prisma.application.update({
      where: { id },
      data: { status },
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return null;
  }
}

// Check if a user has already applied for a specific job
export async function hasUserAppliedForJob(
  jobId: string,
  applicantId: string
): Promise<boolean> {
  const application = await prisma.application.findUnique({
    where: {
      jobId_applicantId: {
        jobId,
        applicantId,
      },
    },
  });

  return !!application;
}

// Get application statistics for an employer
export async function getApplicationStats(employerId: string): Promise<{
  total: number;
  pending: number;
  reviewed: number;
  accepted: number;
  rejected: number;
}> {
  const stats = await prisma.application.groupBy({
    by: ['status'],
    where: {
      job: { employerId },
    },
    _count: {
      status: true,
    },
  });

  const result = {
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0,
  };

  stats.forEach((stat) => {
    result.total += stat._count.status;
    switch (stat.status) {
      case ApplicationStatus.PENDING:
        result.pending = stat._count.status;
        break;
      case ApplicationStatus.REVIEWED:
        result.reviewed = stat._count.status;
        break;
      case ApplicationStatus.ACCEPTED:
        result.accepted = stat._count.status;
        break;
      case ApplicationStatus.REJECTED:
        result.rejected = stat._count.status;
        break;
    }
  });

  return result;
}