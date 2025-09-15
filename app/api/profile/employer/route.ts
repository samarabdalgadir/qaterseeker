import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOrUpdateEmployerProfile, getUserByAuthId } from '@/lib/users';

/**
 * Create or update employer profile
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

    // Check if user is an employer
    if (dbUser.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Only employers can create employer profiles' },
        { status: 403 }
      );
    }

    const { companyName, website, description } = await request.json();

    if (!companyName || !companyName.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const success = await createOrUpdateEmployerProfile(dbUser.id, {
      companyName: companyName.trim(),
      website,
      description,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating employer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get employer profile
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

    // Get user from database with profile
    const dbUser = await getUserByAuthId(userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (dbUser.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Only employers can access employer profiles' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      profile: dbUser.employerProfile,
    });
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
