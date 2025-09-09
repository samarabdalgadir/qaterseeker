# Simple Jobs Portal Implementation Prompt

## Objective
Implement a complete jobs portal application based on the specifications in `.kiro/specs/simple-jobs-portal/` with full functionality for job seekers and employers, proper database setup, and successful build deployment.

## Phase 1: Database Schema & Setup

### 1.1 Extend Prisma Schema
- Add Job and Application models to `prisma/schema.prisma`
- Include JobStatus and ApplicationStatus enums
- Ensure proper relationships between User, Job, and Application models
- Add unique constraint on Application (jobId, applicantId) to prevent duplicates

### 1.2 Database Migration
- Generate and run Prisma migration for new schema
- Verify all tables are created in Supabase
- Update Prisma client types
- Test database connections and relationships

## Phase 2: Core Data Layer

### 2.1 Job Repository Functions
- Create job CRUD operations in `lib/jobs.ts`
- Implement job filtering by title, location, company, salary range
- Add pagination support for job listings
- Include search functionality across job fields

### 2.2 Application Repository Functions  
- Create application CRUD operations in `lib/applications.ts`
- Implement duplicate application prevention logic
- Add application status management functions
- Include applicant-job relationship queries

## Phase 3: Authentication & Role Management

### 3.1 Role-Based Access Control
- Create `RoleGuard` component for route protection
- Implement middleware for role-based access in `middleware.ts`
- Add redirect logic for unauthorized access attempts
- Ensure proper session handling

### 3.2 User Profile Setup
- Create profile setup flow for new users
- Implement role selection (job_seeker/employer) during registration
- Build JobSeekerProfile and EmployerProfile setup forms
- Integrate with existing Supabase auth system

## Phase 4: Public Job Browsing

### 4.1 Job Listings Page
- Create `/app/jobs/page.tsx` with server-side rendering
- Build `JobCard` component for job summaries
- Implement search and filter UI components
- Add "No jobs available" state handling

### 4.2 Job Details Page
- Create `/app/jobs/[id]/page.tsx` for individual job details
- Build `JobDetails` component with full job information
- Add conditional "Apply" button for authenticated job seekers
- Handle job not found scenarios

## Phase 5: Job Application System

### 5.1 Application Form
- Create `/app/jobs/apply/[id]/page.tsx` for job applications
- Build application form with cover letter input
- Implement form validation and submission logic
- Add duplicate application prevention on frontend

### 5.2 Job Seeker Dashboard
- Create `/app/dashboard/job-seeker/page.tsx`
- Display list of submitted applications with status
- Implement application tracking functionality
- Add application history and status updates

## Phase 6: Employer Job Management

### 6.1 Job Posting System
- Create job posting form component
- Implement form validation for required fields (title, description, location)
- Add job submission with employer association
- Include salary range and company information fields

### 6.2 Employer Dashboard
- Create `/app/dashboard/employer/page.tsx`
- Display list of posted jobs with application counts
- Implement job management (edit, close, reopen) functionality
- Add job performance metrics

### 6.3 Application Management
- Create application viewing interface for employers
- Display applicant information and cover letters
- Implement application status updates (pending, reviewed, accepted, rejected)
- Add applicant contact information display

## Phase 7: UI/UX Implementation

### 7.1 Responsive Navigation
- Create role-based navigation menu component
- Implement mobile-responsive navigation using existing Tailwind setup
- Add user authentication status indicators
- Ensure proper navigation between all sections

### 7.2 Form Validation & Feedback
- Implement client-side form validation with proper error messages
- Add loading states for all form submissions
- Create success/error notification system using existing UI components
- Ensure accessibility compliance

### 7.3 Search & Filtering
- Create job search component with text input
- Implement location-based filtering dropdown
- Add salary range filtering with min/max inputs
- Build company name filtering functionality

## Phase 8: Testing & Quality Assurance

### 8.1 Component Testing
- Write unit tests for all major components (JobCard, JobDetails, forms)
- Test form validation logic thoroughly
- Test role-based access control functions
- Ensure proper error handling in all components

### 8.2 Integration Testing
- Test complete job posting workflow end-to-end
- Test job application submission flow
- Test dashboard functionality for both user types
- Verify database operations and data persistence

### 8.3 Authentication Testing
- Test user registration with role selection
- Verify role-based route protection
- Test session management and logout functionality
- Ensure proper redirects for unauthorized access

## Phase 9: Performance & Error Handling

### 9.1 Error Handling
- Implement proper error boundaries for React components
- Add comprehensive error logging
- Create user-friendly error messages for all failure scenarios
- Handle network errors and database connection issues

### 9.2 Performance Optimization
- Implement database query optimization with proper indexing
- Add client-side caching for frequently accessed data
- Optimize images and assets loading
- Implement proper loading states

## Phase 10: Build & Deployment Verification

### 10.1 Build Process
- Ensure `npm run build` completes successfully
- Verify all TypeScript types are properly resolved
- Check that all environment variables are properly configured
- Test production build locally

### 10.2 Database Verification
- Confirm all required tables exist in Supabase:
  - User (existing)
  - JobSeekerProfile (existing)
  - EmployerProfile (existing)
  - Job (new)
  - Application (new)
- Verify all relationships and constraints are working
- Test data operations in production environment

### 10.3 Feature Verification Checklist
- [ ] Job seekers can browse jobs without authentication
- [ ] Job seekers can register and apply for jobs
- [ ] Employers can register and post job listings
- [ ] Employers can view applications for their jobs
- [ ] Role-based access control works properly
- [ ] Responsive design works on mobile and desktop
- [ ] Search and filtering functionality works
- [ ] All forms have proper validation
- [ ] Error handling works for all scenarios
- [ ] Build process completes without errors

## Success Criteria
1. All 6 requirements from `requirements.md` are fully implemented
2. All database tables are created and functioning in Supabase
3. Application builds successfully with `npm run build`
4. All user journeys work end-to-end without errors
5. Responsive design works across all device sizes
6. Proper error handling and user feedback throughout
7. Role-based access control prevents unauthorized actions
8. No TypeScript errors or build warnings

## Implementation Notes
- Use existing Next.js 15 + Supabase + Prisma setup
- Leverage existing Tailwind CSS and Radix UI components
- Follow existing code patterns and project structure
- Ensure all new code follows TypeScript best practices
- Maintain consistency with existing authentication system
- Use Server Components and Server Actions where appropriate