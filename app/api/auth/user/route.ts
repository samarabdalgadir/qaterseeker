import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserByAuthId, createUser } from '@/lib/users';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Try to get user from database
    let dbUser = await getUserByAuthId(user.id);

    // If user doesn't exist in database, create them
    if (!dbUser) {
      const userData = user.user_metadata || {};
      dbUser = await createUser({
        email: user.email!,
        name: userData.name || user.email!.split('@')[0],
        clerkId: user.id,
        role: userData.role || 'JOBSEEKER',
        imageUrl: userData.avatar_url,
      });
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Failed to create or fetch user' },
        { status: 500 }
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