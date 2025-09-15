import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { hasUserAppliedForJob } from '@/lib/applications';
import { getUserByAuthId } from '@/lib/users';

/**
 * Check if user has applied for a specific job
 * Requires Clerk authentication
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
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
    const hasApplied = await hasUserAppliedForJob(params.id, dbUser.id);
    
    return NextResponse.json({ hasApplied });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json(
      { error: 'Failed to check application status' },
      { status: 500 }
    );
  }
}