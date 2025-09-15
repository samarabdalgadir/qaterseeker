import { Navigation } from '@/components/navigation';
import { JobCard } from '@/components/job-card';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { JobFilters, JobWithEmployer } from '@/lib/jobs';

interface JobsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    location?: string;
    company?: string;
    salaryMin?: string;
    salaryMax?: string;
  }>;
}

/**
 * Fetches jobs from Supabase with server-side rendering
 */
async function getJobs(searchParams: {
  search?: string;
  location?: string;
  company?: string;
  salaryMin?: string;
  salaryMax?: string;
  page?: string;
  limit?: string;
}) {
  console.log('🔍 getJobs called with searchParams:', searchParams);
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const offset = (page - 1) * limit;

  console.log('📊 Pagination params:', { page, limit, offset });

  const filters: JobFilters = {
    search: searchParams.search || undefined,
    location: searchParams.location || undefined,
    company: searchParams.company || undefined,
    salaryMin: searchParams.salaryMin ? parseInt(searchParams.salaryMin) : undefined,
    salaryMax: searchParams.salaryMax ? parseInt(searchParams.salaryMax) : undefined,
  };

  console.log('🔧 Applied filters:', filters);

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
    console.log('🔍 Search filter applied:', filters.search);
  }
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
    console.log('📍 Location filter applied:', filters.location);
  }
  if (filters.company) {
    query = query.ilike('company', `%${filters.company}%`);
    console.log('🏢 Company filter applied:', filters.company);
  }
  if (filters.salaryMin) {
    query = query.gte('salaryMin', filters.salaryMin);
    console.log('💰 Salary min filter applied:', filters.salaryMin);
  }
  if (filters.salaryMax) {
    query = query.lte('salaryMax', filters.salaryMax);
    console.log('💰 Salary max filter applied:', filters.salaryMax);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  console.log('📄 Pagination applied:', { offset, limit });

  console.log('🚀 Executing Supabase query...');
  const { data: jobs, error, count } = await query;

  console.log('📥 Supabase response received:');
  console.log('  - Error:', error);
  console.log('  - Count:', count);
  console.log('  - Jobs data length:', jobs?.length || 0);
  console.log('  - First job (if any):', jobs?.[0] || 'No jobs found');

  if (error) {
    console.error('❌ Supabase query error:', error);
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  // Add default _count for applications since it's not available in Supabase
  const jobsWithCount = (jobs || []).map(job => ({
    ...job,
    _count: { applications: 0 }
  }));

  const result = {
    jobs: jobsWithCount,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };

  console.log('✅ getJobs result:', {
    jobsCount: result.jobs.length,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages
  });

  return result;
}

/**
 * Server component for jobs page using NextJS recommended Supabase pattern
 */
export default async function JobsPage({ searchParams }: JobsPageProps) {
  try {
    const resolvedSearchParams = await searchParams;
    const { jobs, total } = await getJobs(resolvedSearchParams);
    
    const currentFilters: JobFilters = {
      search: resolvedSearchParams.search,
      location: resolvedSearchParams.location,
      company: resolvedSearchParams.company,
      salaryMin: resolvedSearchParams.salaryMin ? parseInt(resolvedSearchParams.salaryMin) : undefined,
      salaryMax: resolvedSearchParams.salaryMax ? parseInt(resolvedSearchParams.salaryMax) : undefined,
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
              <p className="text-gray-600">
                {total > 0 ? `${total} job${total !== 1 ? 's' : ''} available` : 'Discover opportunities that match your skills'}
              </p>
            </div>

            {/* Jobs List */}
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">
                  {Object.keys(currentFilters).some(key => currentFilters[key as keyof JobFilters])
                    ? 'Try adjusting your search filters to find more opportunities.'
                    : 'No jobs are currently posted. Check back later for new opportunities.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job: JobWithEmployer) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Listings</h1>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">
                Error loading jobs: {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}