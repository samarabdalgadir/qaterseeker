import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createJob, getJobsByEmployer } from '@/lib/jobs';
import { getUserByAuthId } from '@/lib/users';

/**
 * Get jobs for the current employer
 * Requires Clerk authentication and EMPLOYER role
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

    // Get user from database
    const dbUser = await getUserByAuthId(userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const jobs = await getJobsByEmployer(dbUser.id);
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

/**
 * Create a new job
 * Requires Clerk authentication and EMPLOYER role
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

    const { title, description, location, salaryMin, salaryMax, company } = await request.json();

    if (!title || !description || !location || !company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = await createJob({
      title,
      description,
      location,
      salaryMin,
      salaryMax,
      company,
      employerId: dbUser.id,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}