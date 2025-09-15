import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getApplicationsForJob } from '@/lib/applications';
import { getUserByAuthId } from '@/lib/users';

/**
 * Get applications for a specific job (employer only)
 * Requires Clerk authentication and EMPLOYER role
 */
export async function GET(
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

    const params = await context.params;
    const applications = await getApplicationsForJob(params.id, dbUser.id);
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}