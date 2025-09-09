'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApplicationWithDetails } from '@/lib/applications';
import { JobWithEmployer } from '@/lib/jobs';

interface ApplicationsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobApplicationsPage({ params }: ApplicationsPageProps) {
  const [job, setJob] = useState<JobWithEmployer | null>(null);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    
    const fetchData = async () => {
      try {
        const [jobResponse, applicationsResponse] = await Promise.all([
          fetch(`/api/jobs/${resolvedParams.id}`),
          fetch(`/api/employer/jobs/${resolvedParams.id}/applications`)
        ]);

        if (!jobResponse.ok || !applicationsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [jobData, applicationsData] = await Promise.all([
          jobResponse.json(),
          applicationsResponse.json()
        ]);

        setJob(jobData);
        setApplications(applicationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams]);

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: status as ApplicationWithDetails['status'] } : app
        )
      );
    } catch {
      alert('Failed to update application status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href="/" className="font-bold text-lg">Qatar Seeker</Link>
            <Link href="/dashboard/employer" className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">← Dashboard</Link>
          </div>
        </nav>
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading applications...</p>
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
            <Link href="/dashboard/employer" className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">← Dashboard</Link>
          </div>
        </nav>
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Applications</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link
                href="/dashboard/employer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ← Back to Dashboard
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
          <Link href="/dashboard/employer" className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">← Dashboard</Link>
        </div>
      </nav>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/dashboard/employer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </nav>

          {/* Job Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="space-y-1 text-gray-600">
                  <p>{job.company}</p>
                  <p>{job.location}</p>
                  <p>Posted on {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600">
                No one has applied for this position yet. Applications will appear here when received.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Applicant Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.applicant.name || 'Anonymous Applicant'}
                          </h3>
                          <p className="text-gray-600">{application.applicant.email}</p>
                          <p className="text-sm text-gray-500">
                            Applied on {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>

                      {/* Profile Info */}
                      {application.applicant.jobSeekerProfile && (
                        <div className="mb-4">
                          {application.applicant.jobSeekerProfile.bio && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Bio:</h4>
                              <p className="text-sm text-gray-600">{application.applicant.jobSeekerProfile.bio}</p>
                            </div>
                          )}
                          {application.applicant.jobSeekerProfile.skills.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Skills:</h4>
                              <div className="flex flex-wrap gap-1">
                                {application.applicant.jobSeekerProfile.skills.map((skill, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cover Letter */}
                      {application.coverLetter && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {application.coverLetter}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <a
                        href={`mailto:${application.applicant.email}`}
                        className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors text-center"
                      >
                        Contact Applicant
                      </a>
                      
                      {application.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'REVIEWED')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Mark as Reviewed
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                            className="px-4 py-2 text-sm font-medium text-green-700 border border-green-300 rounded-md hover:bg-green-50 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            className="px-4 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {application.status === 'REVIEWED' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                            className="px-4 py-2 text-sm font-medium text-green-700 border border-green-300 rounded-md hover:bg-green-50 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            className="px-4 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}