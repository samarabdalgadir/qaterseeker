import Link from 'next/link';
import { JobWithEmployer } from '@/lib/jobs';

interface JobCardProps {
  job: JobWithEmployer;
}

export function JobCard({ job }: JobCardProps) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const companyName = job.employer.employerProfile?.companyName || job.company;

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer bg-white">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
          <span className="text-sm text-gray-500">
            {job._count.applications} applicant{job._count.applications !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-700 font-medium">{companyName}</p>
          <p className="text-gray-600">{job.location}</p>
          <p className="text-green-600 font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {job.description}
        </p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          <span className="text-blue-600 hover:text-blue-800 font-medium">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}