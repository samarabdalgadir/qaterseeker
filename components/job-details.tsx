import { JobWithEmployer } from '@/lib/jobs';

interface JobDetailsProps {
  job: JobWithEmployer;
  showApplyButton?: boolean;
  onApply?: () => void;
  hasApplied?: boolean;
}

export function JobDetails({ job, showApplyButton = false, onApply, hasApplied = false }: JobDetailsProps) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const companyName = job.employer.employerProfile?.companyName || job.company;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-8 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="space-y-2">
              <p className="text-xl text-gray-700 font-medium">{companyName}</p>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
                <span className="flex items-center text-green-600 font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
                <span className="text-sm">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Apply Button */}
          {showApplyButton && (
            <div className="flex-shrink-0">
              {hasApplied ? (
                <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                  ✓ Applied
                </div>
              ) : (
                <button
                  onClick={onApply}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Job Details */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="text-sm text-gray-900 mt-1">{companyName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900 mt-1">{job.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                  <dd className="text-sm text-gray-900 mt-1">{formatSalary(job.salaryMin, job.salaryMax)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Job Status</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {job.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Applications</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {job._count.applications} applicant{job._count.applications !== 1 ? 's' : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Posted Date</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}