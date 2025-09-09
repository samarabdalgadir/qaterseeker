# Design Document

## Overview

The Simple Jobs Portal will extend the existing Next.js application with job posting and application functionality. The system will leverage the current Prisma schema with User, JobSeekerProfile, and EmployerProfile models, and add new models for Jobs and Applications. The application will use Supabase for authentication and data storage, while maintaining the existing UI component structure with Tailwind CSS and Radix UI.

## Architecture

### Technology Stack
- **Frontend**: Next.js 15 with React 19, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma Client
- **Authentication**: Supabase Auth (existing setup)
- **State Management**: React Server Components with Server Actions

### Application Structure
```
app/
├── jobs/                    # Public job listings
│   ├── page.tsx            # Job listings page
│   ├── [id]/               # Individual job details
│   └── apply/[id]/         # Job application form
├── dashboard/              # Protected routes
│   ├── employer/           # Employer dashboard
│   └── job-seeker/         # Job seeker dashboard
└── api/                    # API routes for server actions
```

## Components and Interfaces

### Core Components

#### Job Listing Components
- `JobCard`: Display job summary in listings
- `JobDetails`: Full job information display
- `JobFilters`: Search and filter functionality
- `JobApplicationForm`: Application submission form

#### Dashboard Components
- `EmployerDashboard`: Job management interface
- `JobSeekerDashboard`: Application tracking
- `JobPostForm`: Create/edit job postings
- `ApplicationsList`: View received applications

#### Shared Components
- `RoleGuard`: Route protection based on user role
- `UserProfileSetup`: Initial profile configuration
- `NavigationMenu`: Role-based navigation

### Database Schema Extensions

```prisma
model Job {
  id          String   @id @default(cuid())
  title       String
  description String
  location    String
  salaryMin   Int?
  salaryMax   Int?
  company     String
  employerId  String
  status      JobStatus @default(ACTIVE)
  
  employer    User @relation(fields: [employerId], references: [id])
  applications Application[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Application {
  id          String @id @default(cuid())
  jobId       String
  applicantId String
  coverLetter String?
  status      ApplicationStatus @default(PENDING)
  
  job         Job @relation(fields: [jobId], references: [id])
  applicant   User @relation(fields: [applicantId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([jobId, applicantId]) // Prevent duplicate applications
}

enum JobStatus {
  ACTIVE
  CLOSED
  DRAFT
}

enum ApplicationStatus {
  PENDING
  REVIEWED
  ACCEPTED
  REJECTED
}
```

## Data Models

### Job Model
- **Purpose**: Store job posting information
- **Key Fields**: title, description, location, salary range, company
- **Relationships**: belongs to employer (User), has many applications
- **Validation**: Required fields for title, description, location

### Application Model
- **Purpose**: Track job applications from seekers to employers
- **Key Fields**: job reference, applicant reference, cover letter, status
- **Relationships**: belongs to job and applicant (User)
- **Constraints**: Unique constraint on jobId + applicantId to prevent duplicates

### User Role Extensions
- **JobSeeker Role**: Can browse jobs, submit applications, view application status
- **Employer Role**: Can post jobs, manage listings, view applications
- **Profile Requirements**: JobSeekerProfile for seekers, EmployerProfile for employers

## Error Handling

### Authentication Errors
- Redirect unauthenticated users to login page
- Display role-based access denied messages
- Handle session expiration gracefully

### Database Errors
- Validate required fields before submission
- Handle duplicate application attempts
- Provide user-friendly error messages for database constraints

### Form Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Clear error messaging for form fields

### API Error Responses
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
```

## Testing Strategy

### Unit Testing
- Test individual components with React Testing Library
- Test utility functions and validation logic
- Test Prisma model operations

### Integration Testing
- Test API routes with mock database
- Test authentication flows
- Test role-based access control

### End-to-End Testing
- Test complete user journeys (job posting, application flow)
- Test responsive design across devices
- Test form submissions and data persistence

### Database Testing
- Test schema migrations
- Test data relationships and constraints
- Test query performance with sample data

## Security Considerations

### Authentication & Authorization
- Verify user authentication on all protected routes
- Implement role-based access control (RBAC)
- Validate user permissions for data access

### Data Protection
- Sanitize user inputs to prevent XSS
- Use parameterized queries via Prisma to prevent SQL injection
- Validate file uploads (resume files)

### Privacy
- Limit access to personal information based on user roles
- Implement proper data access patterns
- Secure API endpoints with proper authentication

## Performance Optimization

### Database Optimization
- Index frequently queried fields (job title, location, status)
- Use Prisma's include/select for efficient data fetching
- Implement pagination for job listings

### Frontend Optimization
- Use Next.js Server Components for initial page loads
- Implement client-side caching for frequently accessed data
- Optimize images and assets

### Caching Strategy
- Cache job listings with appropriate TTL
- Use React Query or SWR for client-side data fetching
- Implement proper cache invalidation

## Deployment Considerations

### Environment Configuration
- Separate development and production database URLs
- Secure environment variable management
- Configure Supabase connection pooling

### Database Migrations
- Use Prisma migrations for schema changes
- Plan migration strategy for production deployment
- Backup strategy for data protection