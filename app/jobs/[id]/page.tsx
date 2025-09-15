'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JobDetails } from '@/components/job-details';
import { JobWithEmployer } from '@/lib/jobs';

interface JobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobPage({ params }: JobPageProps) {
  const [job, setJob] = useState<JobWithEmployer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${resolvedParams.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Job not found');
          }
          throw new Error('Failed to fetch job details');
        }
        const jobData = await response.json();
        setJob(jobData);

        // Check if user is authenticated and has applied
        const userResponse = await fetch('/api/auth/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);

          // Check if user has applied for this job
          const applicationResponse = await fetch(`/api/jobs/${resolvedParams.id}/application-status`);
          if (applicationResponse.ok) {
            const { hasApplied: applied } = await applicationResponse.json();
            setHasApplied(applied);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [resolvedParams]);

  const handleApply = () => {
    if (!resolvedParams) return;
    
    if (!user) {
      // Redirect to Clerk sign-in with return URL
      router.push(`/sign-in?redirect_url=/jobs/${resolvedParams.id}`);
      return;
    }

    if (user.role !== 'JOBSEEKER') {
      alert('Only job seekers can apply for jobs.');
      return;
    }

    // Redirect to application form
    router.push(`/jobs/apply/${resolvedParams.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'Job not found' ? 'Job Not Found' : 'Error Loading Job'}
            </h1>
            <p className="text-gray-600 mb-4">
              {error === 'Job not found' 
                ? 'The job you are looking for does not exist or has been removed.'
                : error || 'An unexpected error occurred while loading the job details.'}
            </p>
            <div className="space-x-4">
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                ← Back to Jobs
              </Link>
              {error !== 'Job not found' && (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showApplyButton = Boolean(
    user && user.role === 'JOBSEEKER' && job && job.status === 'ACTIVE'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-6 items-center">
            <Link href="/" className="font-bold text-lg">
              Qatar Seeker
            </Link>
            <Link 
              href="/jobs" 
              className="font-medium text-blue-600"
            >
              Browse Jobs
            </Link>
          </div>
          <div className="flex gap-2">
            <Link
              href="/sign-in"
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/jobs"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Jobs
          </Link>
        </nav>

        {/* Job Details */}
        <JobDetails
          job={job}
          showApplyButton={showApplyButton || false}
          onApply={handleApply}
          hasApplied={hasApplied}
        />

        {/* Additional Actions */}
        {!user && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <Link href="/sign-in" className="font-medium hover:underline">
                Sign in
              </Link>{' '}
              or{' '}
              <Link href="/sign-up" className="font-medium hover:underline">
                create an account
              </Link>{' '}
              to apply for this job.
            </p>
          </div>
        )}

        {user && user.role === 'EMPLOYER' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              You are viewing this job as an employer. Only job seekers can apply for positions.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}