import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/jobs/apply/(.*)',
  '/api/applications(.*)',
  '/api/profile(.*)',
  '/api/employer(.*)',
  '/protected(.*)'
])

/**
 * Clerk middleware for handling authentication and route protection
 * Automatically handles authentication state and redirects unauthenticated users
 */
export default clerkMiddleware(async (auth, req) => {
  // Check if the current route requires authentication
  if (isProtectedRoute(req)) {
    // Protect the route - this will redirect to sign-in if user is not authenticated
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}