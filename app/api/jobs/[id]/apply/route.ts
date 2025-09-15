import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createApplication } from '@/lib/applications';
import { getUserByAuthId } from '@/lib/users';

/**
 * Apply for a job
 * Requires Clerk authentication
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { coverLetter } = await request.json();

    const params = await context.params;
    const application = await createApplication({
      jobId: params.id,
      applicantId: dbUser.id,
      coverLetter,
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Failed to create application. You may have already applied for this job.' },
        { status: 400 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}