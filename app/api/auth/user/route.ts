import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByAuthId } from '@/lib/users';

/**
 * Get current authenticated user information
 * Uses Clerk authentication to verify user identity
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Try to get user from database
    const dbUser = await getUserByAuthId(userId);

    // If user doesn't exist in database, we'll need to create them
    // This should typically be handled by webhooks, but this is a fallback
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database. Please complete registration.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      imageUrl: dbUser.imageUrl,
      hasJobSeekerProfile: !!dbUser.jobSeekerProfile,
      hasEmployerProfile: !!dbUser.employerProfile,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}