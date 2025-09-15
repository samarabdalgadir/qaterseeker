-- Complete Supabase Setup Script
-- Run this script in your Supabase SQL Editor to set up the database

-- ============================================================================
-- PART 1: CREATE SCHEMA
-- ============================================================================

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

-- ============================================================================
-- PART 1.5: ENABLE ROW LEVEL SECURITY AND CREATE POLICIES
-- ============================================================================

-- Enable Row Level Security (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobSeekerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Jobs are publicly readable (no authentication required)
CREATE POLICY "Jobs are publicly readable" ON "Job"
  FOR SELECT USING (true);

-- Employers can manage their own jobs
CREATE POLICY "Employers can manage own jobs" ON "Job"
  FOR ALL USING (auth.uid()::text = "employerId");

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- Job seekers can view and update their own profile
CREATE POLICY "Job seekers can view own profile" ON "JobSeekerProfile"
  FOR ALL USING (auth.uid()::text = "userId");

-- Employers can view and update their own profile
CREATE POLICY "Employers can view own profile" ON "EmployerProfile"
  FOR ALL USING (auth.uid()::text = "userId");

-- Job seekers can manage their own applications
CREATE POLICY "Job seekers can manage own applications" ON "Application"
  FOR ALL USING (auth.uid()::text = "applicantId");

-- Employers can view applications to their jobs
CREATE POLICY "Employers can view applications to their jobs" ON "Application"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Job" WHERE "Job".id = "Application"."jobId" AND "Job"."employerId" = auth.uid()::text
    )
  );

-- Employers can update applications to their jobs
CREATE POLICY "Employers can update applications to their jobs" ON "Application"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Job" WHERE "Job".id = "Application"."jobId" AND "Job"."employerId" = auth.uid()::text
    )
  );

-- ============================================================================
-- PART 2: INSERT SAMPLE DATA
-- ============================================================================

-- Insert sample users (employers and job seekers)
INSERT INTO "User" ("id", "email", "name", "role", "clerkId") VALUES
('user-employer-1', 'employer1@dohatech.qa', 'Ahmed Al-Mansouri', 'EMPLOYER', 'clerk-employer-1'),
('user-employer-2', 'hr@qatarcloud.com', 'Fatima Al-Thani', 'EMPLOYER', 'clerk-employer-2'),
('user-employer-3', 'jobs@qatarenergy.qa', 'Mohammed Al-Kuwari', 'EMPLOYER', 'clerk-employer-3'),
('user-employer-4', 'careers@qnb.qa', 'Aisha Al-Naimi', 'EMPLOYER', 'clerk-employer-4'),
('user-employer-5', 'hr@ooredoo.qa', 'Omar Al-Dosari', 'EMPLOYER', 'clerk-employer-5'),
('user-jobseeker-1', 'sara.ahmed@email.com', 'Sara Ahmed', 'JOBSEEKER', 'clerk-jobseeker-1'),
('user-jobseeker-2', 'khalid.hassan@email.com', 'Khalid Hassan', 'JOBSEEKER', 'clerk-jobseeker-2'),
('user-jobseeker-3', 'noor.ali@email.com', 'Noor Ali', 'JOBSEEKER', 'clerk-jobseeker-3');

-- Insert employer profiles
INSERT INTO "EmployerProfile" ("id", "userId", "companyName", "website", "description") VALUES
('emp-profile-1', 'user-employer-1', 'Doha Tech', 'https://dohatech.qa', 'Leading technology company in Qatar specializing in innovative software solutions.'),
('emp-profile-2', 'user-employer-2', 'Qatar Cloud', 'https://qatarcloud.com', 'Cloud infrastructure and services provider for the Middle East region.'),
('emp-profile-3', 'user-employer-3', 'Qatar Energy', 'https://qatarenergy.qa', 'National oil and gas company of Qatar, driving energy innovation.'),
('emp-profile-4', 'user-employer-4', 'Qatar National Bank', 'https://qnb.com', 'The largest financial institution in the Middle East and Africa.'),
('emp-profile-5', 'user-employer-5', 'Ooredoo Qatar', 'https://ooredoo.qa', 'Leading telecommunications company providing innovative digital services.');

-- Insert job seeker profiles
INSERT INTO "JobSeekerProfile" ("id", "userId", "bio", "skills", "resumeUrl") VALUES
('js-profile-1', 'user-jobseeker-1', 'Experienced frontend developer with 5+ years in React and TypeScript.', 'React,TypeScript,JavaScript,CSS,HTML,Tailwind CSS', 'https://example.com/resume1.pdf'),
('js-profile-2', 'user-jobseeker-2', 'Full-stack developer passionate about building scalable web applications.', 'Node.js,Python,PostgreSQL,MongoDB,Docker,AWS', 'https://example.com/resume2.pdf'),
('js-profile-3', 'user-jobseeker-3', 'UI/UX designer with strong technical background in frontend development.', 'Figma,Adobe XD,React,CSS,JavaScript,Design Systems', 'https://example.com/resume3.pdf');

-- Insert sample jobs
INSERT INTO "Job" ("id", "title", "description", "location", "salaryMin", "salaryMax", "company", "employerId", "status") VALUES
('job-1', 'Senior Frontend Developer', 'Build delightful UIs with React and TailwindCSS. Work closely with product and design teams to create exceptional user experiences. We are looking for someone with strong TypeScript skills and experience with modern frontend tooling.', 'Doha, Qatar', 9000, 15000, 'Doha Tech', 'user-employer-1', 'ACTIVE'),
('job-2', 'Backend Engineer', 'Design and build robust APIs with Node.js and PostgreSQL. Experience with Prisma is a plus. You will be responsible for architecting scalable backend systems and ensuring high performance and reliability.', 'Remote - Qatar', 10000, 17000, 'Qatar Cloud', 'user-employer-2', 'ACTIVE'),
('job-3', 'Full Stack Developer', 'Work on both frontend and backend systems using modern technologies. Experience with React, Node.js, and cloud platforms required. Join our team to build the next generation of web applications.', 'Doha, Qatar', 8000, 14000, 'Doha Tech', 'user-employer-1', 'ACTIVE'),
('job-4', 'DevOps Engineer', 'Manage cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes required. Help us scale our infrastructure to serve millions of users across the region.', 'Doha, Qatar', 12000, 20000, 'Qatar Cloud', 'user-employer-2', 'ACTIVE'),
('job-5', 'Data Scientist', 'Analyze large datasets and build machine learning models to drive business insights. Experience with Python, SQL, and ML frameworks required. Work with cutting-edge technology in the energy sector.', 'Doha, Qatar', 11000, 18000, 'Qatar Energy', 'user-employer-3', 'ACTIVE'),
('job-6', 'Mobile App Developer', 'Develop native mobile applications for iOS and Android. Experience with React Native or Flutter preferred. Create mobile experiences that delight our customers.', 'Doha, Qatar', 9500, 16000, 'Qatar National Bank', 'user-employer-4', 'ACTIVE'),
('job-7', 'UI/UX Designer', 'Design intuitive user interfaces and experiences for web and mobile applications. Strong portfolio and experience with design tools required. Shape the future of digital banking in Qatar.', 'Doha, Qatar', 7000, 12000, 'Qatar National Bank', 'user-employer-4', 'ACTIVE'),
('job-8', 'Network Engineer', 'Design and maintain telecommunications network infrastructure. Experience with 5G and fiber optic networks preferred. Join the team building Qatar\'s digital future.', 'Doha, Qatar', 10500, 17500, 'Ooredoo Qatar', 'user-employer-5', 'ACTIVE'),
('job-9', 'Product Manager', 'Lead product development from conception to launch. Experience in tech or telecommunications industry required. Drive innovation in digital services and customer experience.', 'Doha, Qatar', 13000, 22000, 'Ooredoo Qatar', 'user-employer-5', 'ACTIVE'),
('job-10', 'Software Engineer Intern', 'Learn and contribute to real-world software projects. Perfect for recent graduates or students. Gain hands-on experience with modern development practices and technologies.', 'Doha, Qatar', 3000, 5000, 'Doha Tech', 'user-employer-1', 'ACTIVE'),
('job-11', 'Senior Data Engineer', 'Build and maintain data pipelines and analytics infrastructure. Experience with big data technologies and cloud platforms required. Work with petabytes of energy sector data.', 'Doha, Qatar', 14000, 23000, 'Qatar Energy', 'user-employer-3', 'ACTIVE'),
('job-12', 'Cybersecurity Specialist', 'Protect our digital assets and ensure compliance with security standards. Experience with security frameworks and penetration testing required. Safeguard critical financial infrastructure.', 'Doha, Qatar', 12500, 20000, 'Qatar National Bank', 'user-employer-4', 'ACTIVE'),
('job-13', 'Cloud Solutions Architect', 'Design and implement cloud-based solutions for enterprise clients. AWS/Azure certifications preferred. Lead digital transformation initiatives across various industries.', 'Remote - Qatar', 15000, 25000, 'Qatar Cloud', 'user-employer-2', 'ACTIVE'),
('job-14', 'Frontend Developer', 'Create responsive web applications using modern JavaScript frameworks. Experience with Vue.js or Angular is a plus. Work on customer-facing applications used by millions.', 'Doha, Qatar', 7500, 13000, 'Ooredoo Qatar', 'user-employer-5', 'ACTIVE'),
('job-15', 'Business Analyst', 'Analyze business requirements and translate them into technical specifications. Experience in financial services preferred. Bridge the gap between business and technology teams.', 'Doha, Qatar', 8500, 14500, 'Qatar National Bank', 'user-employer-4', 'ACTIVE');

-- Insert sample applications
INSERT INTO "Application" ("id", "jobId", "applicantId", "coverLetter", "status") VALUES
('app-1', 'job-1', 'user-jobseeker-1', 'I am excited to apply for the Senior Frontend Developer position. With my 5+ years of experience in React and TypeScript, I believe I would be a great fit for your team.', 'PENDING'),
('app-2', 'job-2', 'user-jobseeker-2', 'As a full-stack developer with extensive backend experience, I am very interested in the Backend Engineer role. My experience with Node.js and PostgreSQL aligns perfectly with your requirements.', 'REVIEWED'),
('app-3', 'job-7', 'user-jobseeker-3', 'I am passionate about creating exceptional user experiences and would love to contribute to your design team. My portfolio demonstrates my ability to create intuitive and beautiful interfaces.', 'PENDING'),
('app-4', 'job-3', 'user-jobseeker-2', 'The Full Stack Developer position caught my attention as it combines both my frontend and backend skills. I am excited about the opportunity to work with modern technologies.', 'PENDING'),
('app-5', 'job-14', 'user-jobseeker-1', 'I am interested in expanding my frontend skills and would love to work with Vue.js. My React experience provides a solid foundation for learning new frameworks.', 'PENDING');

-- Update timestamps to make data more realistic
UPDATE "Job" SET 
    "createdAt" = CURRENT_TIMESTAMP - INTERVAL '1 day' * (RANDOM() * 30),
    "updatedAt" = CURRENT_TIMESTAMP - INTERVAL '1 hour' * (RANDOM() * 24)
WHERE "id" LIKE 'job-%';

UPDATE "Application" SET 
    "createdAt" = CURRENT_TIMESTAMP - INTERVAL '1 day' * (RANDOM() * 7),
    "updatedAt" = CURRENT_TIMESTAMP - INTERVAL '1 hour' * (RANDOM() * 12)
WHERE "id" LIKE 'app-%';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your Supabase database is now ready with:
-- ✅ All required tables and relationships
-- ✅ 15 sample jobs from 5 different companies
-- ✅ 8 sample users (5 employers + 3 job seekers)
-- ✅ 5 sample job applications
-- ✅ Proper indexes for performance
-- 
-- Next steps:
-- 1. Update your environment variables with Supabase credentials
-- 2. Test the jobs page functionality
-- 3. Verify data is loading correctly
-- ============================================================================