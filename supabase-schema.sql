-- Supabase Schema for Jobs Portal
-- This script creates the necessary tables and enums for the jobs portal

-- Create enums
CREATE TYPE "BaseRole" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');
CREATE TYPE "UserRole" AS ENUM ('JOBSEEKER', 'EMPLOYER', 'ADMIN');
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DRAFT');
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'JOBSEEKER',
    "baseRole" "BaseRole" NOT NULL DEFAULT 'USER',
    "clerkId" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create JobSeekerProfile table
CREATE TABLE "JobSeekerProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL,
    "bio" TEXT,
    "skills" TEXT, -- Comma-separated skills as in Prisma schema
    "resumeUrl" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create EmployerProfile table
CREATE TABLE "EmployerProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Job table
CREATE TABLE "Job" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "company" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Application table
CREATE TABLE "Application" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE("jobId", "applicantId") -- Prevent duplicate applications
);

-- Create indexes for better performance
CREATE INDEX "Job_employerId_idx" ON "Job"("employerId");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt" DESC);
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");
CREATE INDEX "Application_applicantId_idx" ON "Application"("applicantId");
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- Enable Row Level Security (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobSeekerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid()::text = "clerkId");

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid()::text = "clerkId");

-- Job seekers can read their own profile
CREATE POLICY "Job seekers can view own profile" ON "JobSeekerProfile"
    FOR ALL USING (EXISTS (
        SELECT 1 FROM "User" WHERE "User"."id" = "JobSeekerProfile"."userId" 
        AND "User"."clerkId" = auth.uid()::text
    ));

-- Employers can read their own profile
CREATE POLICY "Employers can view own profile" ON "EmployerProfile"
    FOR ALL USING (EXISTS (
        SELECT 1 FROM "User" WHERE "User"."id" = "EmployerProfile"."userId" 
        AND "User"."clerkId" = auth.uid()::text
    ));

-- Jobs are publicly readable but only employers can manage their own
CREATE POLICY "Jobs are publicly readable" ON "Job"
    FOR SELECT USING (true);

CREATE POLICY "Employers can manage own jobs" ON "Job"
    FOR ALL USING (EXISTS (
        SELECT 1 FROM "User" WHERE "User"."id" = "Job"."employerId" 
        AND "User"."clerkId" = auth.uid()::text
    ));

-- Applications: job seekers can manage their own, employers can view applications to their jobs
CREATE POLICY "Job seekers can manage own applications" ON "Application"
    FOR ALL USING (EXISTS (
        SELECT 1 FROM "User" WHERE "User"."id" = "Application"."applicantId" 
        AND "User"."clerkId" = auth.uid()::text
    ));

CREATE POLICY "Employers can view applications to their jobs" ON "Application"
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM "Job" 
        JOIN "User" ON "User"."id" = "Job"."employerId"
        WHERE "Job"."id" = "Application"."jobId" 
        AND "User"."clerkId" = auth.uid()::text
    ));

CREATE POLICY "Employers can update applications to their jobs" ON "Application"
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM "Job" 
        JOIN "User" ON "User"."id" = "Job"."employerId"
        WHERE "Job"."id" = "Application"."jobId" 
        AND "User"."clerkId" = auth.uid()::text
    ));