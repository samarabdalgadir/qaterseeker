import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByAuthId } from '@/lib/users';
import { getApplicationsByJobSeeker } from '@/lib/applications';

/**
 * Get applications for the current authenticated user
 * Requires Clerk authentication
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

    const applications = await getApplicationsByJobSeeker(dbUser.id);
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}