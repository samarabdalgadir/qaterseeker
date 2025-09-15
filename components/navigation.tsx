'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

import { ThemeSwitcher } from './theme-switcher';

export function Navigation() {
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const getDashboardPath = () => {
    if (!user) return '/sign-in';
    return '/dashboard/job-seeker'; // Default to job seeker dashboard for now
  };

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
            Qatar Seeker
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/jobs"
            className={`font-medium transition-colors ${
              isActive('/jobs') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            Browse Jobs
          </Link>

          {user && (
            <Link
              href={getDashboardPath()}
              className={`font-medium transition-colors ${
                isActive('/dashboard') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
          )}

          {/* Post Job link removed for now - will be added back with role management */}
        </div>

        {/* Desktop Auth & Theme */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeSwitcher />
          {!isLoaded ? (
            <div className="w-20 h-8 animate-pulse bg-gray-200 rounded"></div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Hey, {user.firstName || user.emailAddresses[0]?.emailAddress}!
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <div className="flex gap-2">
              <SignInButton mode="modal">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Sign up
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-2 space-y-2">
            <Link
              href="/jobs"
              className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                isActive('/jobs') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Jobs
            </Link>

            {user && (
              <Link
                href={getDashboardPath()}
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {/* Post Job link removed for now - will be added back with role management */}

            <div className="border-t border-gray-200 pt-2 mt-2">
              {!isLoaded ? (
                <div className="px-3 py-2">
                  <div className="w-24 h-4 animate-pulse bg-gray-200 rounded"></div>
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-700">
                    Hey, {user.firstName || user.emailAddresses[0]?.emailAddress}!
                  </div>
                  <div className="px-3 py-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <SignInButton mode="modal">
                    <button
                      className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="block w-full text-left px-3 py-2 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}