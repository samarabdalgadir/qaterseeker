import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createApplication } from '@/lib/applications';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { coverLetter } = await request.json();

    const params = await context.params;
    const application = await createApplication({
      jobId: params.id,
      applicantId: user.id,
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