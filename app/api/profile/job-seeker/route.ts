import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createOrUpdateJobSeekerProfile, getUserByAuthId } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const dbUser = await getUserByAuthId(user.id);
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

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database with profile
    const dbUser = await getUserByAuthId(user.id);
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
