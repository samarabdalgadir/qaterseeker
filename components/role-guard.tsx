'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

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

  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!isLoaded) return;

        if (!user) {
          router.push(fallbackPath);
          return;
        }

        // For now, allow all authenticated users
        // TODO: Implement role-based access control with Clerk metadata
        setAuthorized(true);
      } catch (error) {
        console.error('Error checking user role:', error);
        router.push(fallbackPath);
      }
    };

    checkUserRole();
  }, [allowedRoles, fallbackPath, router, user, isLoaded]);

  if (!isLoaded) {
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
