import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOrUpdateJobSeekerProfile, getUserByAuthId } from '@/lib/users';

/**
 * Create or update job seeker profile
 * Requires Clerk authentication and JOBSEEKER role
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const dbUser = await getUserByAuthId(userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is a job seeker
    if (dbUser.role !== 'JOBSEEKER') {
      return NextResponse.json(
        { error: 'Only job seekers can create job seeker profiles' },
        { status: 403 }
      );
    }

    const { bio, skills, resumeUrl } = await request.json();

    const success = await createOrUpdateJobSeekerProfile(dbUser.id, {
      bio,
      skills: Array.isArray(skills) ? skills : [],
      resumeUrl,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating job seeker profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get job seeker profile
 * Requires Clerk authentication and JOBSEEKER role
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database with profile
    const dbUser = await getUserByAuthId(userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (dbUser.role !== 'JOBSEEKER') {
      return NextResponse.json(
        { error: 'Only job seekers can access job seeker profiles' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      profile: dbUser.jobSeekerProfile,
    });
  } catch (error) {
    console.error('Error fetching job seeker profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
