# Requirements Document

## Introduction

The Simple Jobs Portal is a proof-of-concept web application that allows employers to post job listings and job seekers to browse and apply for positions. Built on the existing Next.js + Supabase infrastructure, this portal will provide essential job board functionality while maintaining simplicity and focusing on core features. The application will leverage the existing authentication system and extend it to support role-based access for employers and job seekers.

## Requirements

### Requirement 1

**User Story:** As a job seeker, I want to browse available job listings without requiring authentication, so that I can quickly explore opportunities.

#### Acceptance Criteria

1. WHEN a user visits the jobs page THEN the system SHALL display all active job listings
2. WHEN a user views a job listing THEN the system SHALL show job title, company name, location, salary range, and description
3. WHEN a user clicks on a job listing THEN the system SHALL display the full job details page
4. IF no jobs are available THEN the system SHALL display a message indicating no jobs are currently posted

### Requirement 2

**User Story:** As a job seeker, I want to create an account and apply for jobs, so that I can submit my information to potential employers.

#### Acceptance Criteria

1. WHEN a job seeker registers THEN the system SHALL create a profile with role "job_seeker"
2. WHEN an authenticated job seeker views a job THEN the system SHALL display an "Apply" button
3. WHEN a job seeker clicks "Apply" THEN the system SHALL allow them to submit their application with a cover letter
4. WHEN a job seeker submits an application THEN the system SHALL store the application and prevent duplicate applications for the same job
5. WHEN a job seeker views their profile THEN the system SHALL display all their submitted applications with status

### Requirement 3

**User Story:** As an employer, I want to post job listings, so that I can attract qualified candidates for open positions.

#### Acceptance Criteria

1. WHEN an employer registers THEN the system SHALL create a profile with role "employer"
2. WHEN an authenticated employer accesses the dashboard THEN the system SHALL display options to create, edit, and manage job postings
3. WHEN an employer creates a job posting THEN the system SHALL require title, description, location, salary range, and company information
4. WHEN an employer submits a job posting THEN the system SHALL save it with status "active" and display it in the public job listings
5. WHEN an employer views their dashboard THEN the system SHALL display all their posted jobs with application counts

### Requirement 4

**User Story:** As an employer, I want to view applications for my job postings, so that I can review and contact potential candidates.

#### Acceptance Criteria

1. WHEN an employer views their job posting THEN the system SHALL display the number of applications received
2. WHEN an employer clicks on a job posting THEN the system SHALL show all applications for that position
3. WHEN an employer views an application THEN the system SHALL display the applicant's information and cover letter
4. WHEN an employer wants to contact an applicant THEN the system SHALL display the applicant's email address
5. IF a job posting has no applications THEN the system SHALL display a message indicating no applications received

### Requirement 5

**User Story:** As a system administrator, I want user roles to be properly managed, so that employers and job seekers have appropriate access levels.

#### Acceptance Criteria

1. WHEN a user registers THEN the system SHALL assign them either "job_seeker" or "employer" role based on their selection
2. WHEN a job seeker accesses employer features THEN the system SHALL deny access and redirect appropriately
3. WHEN an employer accesses job seeker features THEN the system SHALL deny access and redirect appropriately
4. WHEN an unauthenticated user tries to apply for jobs THEN the system SHALL redirect them to the login page
5. WHEN an unauthenticated user tries to post jobs THEN the system SHALL redirect them to the login page

### Requirement 6

**User Story:** As a user, I want the application to have a clean and responsive interface, so that I can easily use it on any device.

#### Acceptance Criteria

1. WHEN a user accesses the application on mobile THEN the system SHALL display a responsive layout optimized for mobile devices
2. WHEN a user navigates the application THEN the system SHALL provide clear navigation between job listings, applications, and user dashboard
3. WHEN a user interacts with forms THEN the system SHALL provide clear validation messages and feedback
4. WHEN a user performs actions THEN the system SHALL provide loading states and success/error notifications
5. WHEN a user views job listings THEN the system SHALL provide search and basic filtering capabilities