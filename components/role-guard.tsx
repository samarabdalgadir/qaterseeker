'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('JOBSEEKER' | 'EMPLOYER' | 'ADMIN')[];
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}



export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/auth/login',
  loadingComponent 
}: RoleGuardProps) {

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error || !authUser) {
          router.push(fallbackPath);
          return;
        }

        // Fetch user role from API
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          router.push(fallbackPath);
          return;
        }

        const userData = await response.json();

        // Check if user role is allowed
        if (allowedRoles.includes(userData.role)) {
          setAuthorized(true);
        } else {
          // Redirect based on user role
          const redirectPath = userData.role === 'EMPLOYER' 
            ? '/dashboard/employer' 
            : '/dashboard/job-seeker';
          router.push(redirectPath);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        router.push(fallbackPath);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [allowedRoles, fallbackPath, router]);

  if (loading) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for easier usage
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: ('JOBSEEKER' | 'EMPLOYER' | 'ADMIN')[],
  fallbackPath?: string
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}
