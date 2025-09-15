import { PrismaClient, User, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserWithProfile extends User {
  jobSeekerProfile?: {
    id: string;
    bio: string | null;
    skills: string[];
    resumeUrl: string | null;
  } | null;
  employerProfile?: {
    id: string;
    companyName: string;
    website: string | null;
    description: string | null;
  } | null;
}

// Get user by Clerk auth ID (clerkId in our schema)
export async function getUserByAuthId(authId: string): Promise<UserWithProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: authId },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });
    return user as UserWithProfile | null;
  } catch (error) {
    console.error('Error fetching user by auth ID:', error);
    return null;
  }
}

// Create a new user with profile
export async function createUser(data: {
  email: string;
  name: string;
  clerkId: string;
  role: UserRole;
  imageUrl?: string;
}): Promise<UserWithProfile | null> {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        clerkId: data.clerkId,
        role: data.role,
        imageUrl: data.imageUrl,
      },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });
    return user as UserWithProfile;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Update user profile
export async function updateUser(
  userId: string,
  data: Partial<{
    name: string;
    imageUrl: string;
    role: UserRole;
  }>
): Promise<UserWithProfile | null> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });
    return user as UserWithProfile;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// Create or update job seeker profile
export async function createOrUpdateJobSeekerProfile(
  userId: string,
  data: {
    bio?: string;
    skills?: string[];
    resumeUrl?: string;
  }
): Promise<boolean> {
  try {
    await prisma.jobSeekerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
    return true;
  } catch (error) {
    console.error('Error creating/updating job seeker profile:', error);
    return false;
  }
}

// Create or update employer profile
export async function createOrUpdateEmployerProfile(
  userId: string,
  data: {
    companyName: string;
    website?: string;
    description?: string;
  }
): Promise<boolean> {
  try {
    await prisma.employerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
    return true;
  } catch (error) {
    console.error('Error creating/updating employer profile:', error);
    return false;
  }
}

// Check if user has completed their profile setup
export async function hasCompletedProfile(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) return false;

    if (user.role === 'JOBSEEKER') {
      return !!user.jobSeekerProfile;
    } else if (user.role === 'EMPLOYER') {
      return !!user.employerProfile && !!user.employerProfile.companyName;
    }

    return true;
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
}

// Get user statistics (for admin purposes)
export async function getUserStats(): Promise<{
  totalUsers: number;
  jobSeekers: number;
  employers: number;
  admins: number;
}> {
  try {
    const [totalUsers, jobSeekers, employers, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'JOBSEEKER' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return {
      totalUsers,
      jobSeekers,
      employers,
      admins,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalUsers: 0,
      jobSeekers: 0,
      employers: 0,
      admins: 0,
    };
  }
}
