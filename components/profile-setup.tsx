'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';
  hasJobSeekerProfile: boolean;
  hasEmployerProfile: boolean;
}

interface ProfileSetupProps {
  user: User;
  onComplete: () => void;
}

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {

  // Check if profile setup is needed
  const needsSetup = user.role === 'JOBSEEKER' 
    ? !user.hasJobSeekerProfile 
    : user.role === 'EMPLOYER' 
    ? !user.hasEmployerProfile 
    : false;

  if (!needsSetup) {
    onComplete();
    return null;
  }

  if (user.role === 'JOBSEEKER') {
    return <JobSeekerProfileSetup onComplete={onComplete} />;
  } else if (user.role === 'EMPLOYER') {
    return <EmployerProfileSetup onComplete={onComplete} />;
  }

  return null;
}

function JobSeekerProfileSetup({ onComplete }: Omit<ProfileSetupProps, 'user'>) {
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    resumeUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/job-seeker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: formData.bio || null,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          resumeUrl: formData.resumeUrl || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Job Seeker Profile</CardTitle>
          <CardDescription>
            Help employers learn more about you by completing your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (Optional)</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="JavaScript, React, Node.js (comma-separated)"
              />
            </div>

            <div>
              <Label htmlFor="resumeUrl">Resume URL (Optional)</Label>
              <Input
                id="resumeUrl"
                name="resumeUrl"
                type="url"
                value={formData.resumeUrl}
                onChange={handleChange}
                placeholder="https://example.com/resume.pdf"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating Profile...' : 'Complete Profile'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onComplete}
                disabled={loading}
              >
                Skip
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployerProfileSetup({ onComplete }: Omit<ProfileSetupProps, 'user'>) {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.companyName.trim()) {
      setError('Company name is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/employer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName.trim(),
          website: formData.website || null,
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Employer Profile</CardTitle>
          <CardDescription>
            Set up your company profile to start posting jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your Company Name"
                required
              />
            </div>

            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
              />
            </div>

            <div>
              <Label htmlFor="description">Company Description (Optional)</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your company..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={4}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
