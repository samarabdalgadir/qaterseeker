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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const offset = (page - 1) * limit;

  const filters: JobFilters = {
    search: searchParams.search || undefined,
    location: searchParams.location || undefined,
    company: searchParams.company || undefined,
    salaryMin: searchParams.salaryMin ? parseInt(searchParams.salaryMin) : undefined,
    salaryMax: searchParams.salaryMax ? parseInt(searchParams.salaryMax) : undefined,
  };

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

  // Apply status filter to show only active jobs
  query = query.eq('status', 'ACTIVE');

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.company) {
    query = query.ilike('employer.company_name', `%${filters.company}%`);
  }
  if (filters.salaryMin) {
    query = query.gte('salary_min', filters.salaryMin);
  }
  if (filters.salaryMax) {
    query = query.lte('salary_max', filters.salaryMax);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: jobs, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  // Add default _count for applications since it's not available in Supabase
  const jobsWithCount = (jobs || []).map(job => ({
    ...job,
    _count: { applications: 0 }
  }));

  return {
    jobs: jobsWithCount,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
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