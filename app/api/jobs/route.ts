import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export interface JobFilters {
  search?: string;
  location?: string;
  company?: string;
  salaryMin?: number;
  salaryMax?: number;
}

/**
 * GET handler for jobs API endpoint
 * Fetches jobs from Supabase with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    const filters: JobFilters = {
      search: searchParams.get('search') || undefined,
      location: searchParams.get('location') || undefined,
      company: searchParams.get('company') || undefined,
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
      salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined,
    };

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Build query
    let query = supabase
      .from('Job')
      .select(`
        *,
        employer:User!Job_employerId_fkey(
          id,
          name,
          employerProfile:EmployerProfile(
            companyName
          )
        )
      `);

    console.log('🏗️ Base query built for Job table');

    // Apply status filter to show only active jobs
    query = query.eq('status', 'ACTIVE');
    console.log('✅ Status filter applied: ACTIVE jobs only');

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.company) {
      query = query.ilike('company', `%${filters.company}%`);
    }
    if (filters.salaryMin) {
      query = query.gte('salaryMin', filters.salaryMin);
    }
    if (filters.salaryMax) {
      query = query.lte('salaryMax', filters.salaryMax);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: jobs || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}