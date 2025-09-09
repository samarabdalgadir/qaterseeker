import { NextRequest, NextResponse } from 'next/server';
import { getJobs, JobFilters } from '@/lib/jobs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const filters: JobFilters = {
      search: searchParams.get('search') || undefined,
      location: searchParams.get('location') || undefined,
      company: searchParams.get('company') || undefined,
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
      salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof JobFilters] === undefined) {
        delete filters[key as keyof JobFilters];
      }
    });

    const result = await getJobs(page, limit, filters);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}