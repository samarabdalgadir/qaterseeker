'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JobWithEmployer } from '@/lib/jobs';

interface ApplyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const [job, setJob] = useState<JobWithEmployer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
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
        const response = await fetch(`/api/jobs/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const jobData = await response.json();
        setJob(jobData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [resolvedParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !resolvedParams) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverLetter: coverLetter.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      // Redirect to job page with success message
      router.push(`/jobs/${resolvedParams.id}?applied=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href="/" className="font-bold text-lg">Qatar Seeker</Link>
          </div>
        </nav>
        <div className="py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading application form...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href="/" className="font-bold text-lg">Qatar Seeker</Link>
          </div>
        </nav>
        <div className="py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Application</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ← Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <Link href="/" className="font-bold text-lg">Qatar Seeker</Link>
          <div className="flex gap-2">
            <Link href="/jobs" className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Browse Jobs</Link>
          </div>
        </div>
      </nav>
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href={`/jobs/${resolvedParams?.id || ''}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Job Details
            </Link>
          </nav>

          {/* Application Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Position</h1>
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="font-semibold text-gray-900">{job.title}</h2>
                <p className="text-gray-600">{job.employer.employerProfile?.companyName || job.company}</p>
                <p className="text-gray-600">{job.location}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  id="coverLetter"
                  rows={8}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {coverLetter.length}/1000 characters
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
                <Link
                  href={`/jobs/${resolvedParams?.id || ''}`}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Application Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Highlight relevant experience and skills</li>
                <li>• Show enthusiasm for the role and company</li>
                <li>• Keep it concise and professional</li>
                <li>• Proofread before submitting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}