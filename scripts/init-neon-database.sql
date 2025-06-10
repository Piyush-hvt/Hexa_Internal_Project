-- Hexaview Resume Screening Platform Database Schema

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job roles table (enhanced)
CREATE TABLE IF NOT EXISTS job_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    required_skills TEXT[],
    experience_level VARCHAR(50),
    keywords TEXT[],
    resume_threshold INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job positions table (new)
CREATE TABLE IF NOT EXISTS job_positions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    job_role_id INTEGER REFERENCES job_roles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    responsibilities TEXT,
    location VARCHAR(255),
    employment_type VARCHAR(50) DEFAULT 'Full-time',
    salary_range VARCHAR(100),
    experience_required VARCHAR(50),
    skills_required TEXT[],
    qualifications TEXT[],
    benefits TEXT[],
    application_deadline DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table (enhanced)
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(20),
    job_position_id INTEGER REFERENCES job_positions(id),
    resume_file_path VARCHAR(500),
    resume_text TEXT,
    resume_score INTEGER DEFAULT 0,
    screening_score INTEGER DEFAULT 0,
    final_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    analysis_details JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic screening questions table (enhanced)
CREATE TABLE IF NOT EXISTS screening_questions (
    id SERIAL PRIMARY KEY,
    job_position_id INTEGER REFERENCES job_positions(id),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'medium',
    topic VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR notifications log
CREATE TABLE IF NOT EXISTS hr_notifications (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id),
    notification_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent'
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email) VALUES
('admin', '$2b$10$rOzJqQZJQZJQZJQZJQZJQOzJqQZJQZJQZJQZJQZJQZJQZJQZJQZJQ', 'admin@hexaview.com');

-- Insert default company
INSERT INTO companies (name, description, website) VALUES
('Hexaview Technologies', 'Leading technology solutions provider specializing in AI-powered recruitment and talent management.', 'https://hexaview.com');

-- Insert enhanced job roles
INSERT INTO job_roles (role_name, category, required_skills, experience_level, keywords, resume_threshold) VALUES
('QA Engineer', 'Engineering', ARRAY['Testing', 'Automation', 'Selenium', 'API Testing', 'Bug Tracking', 'Test Planning'], 'Mid-level', ARRAY['quality', 'testing', 'automation', 'selenium', 'cypress', 'jest', 'qa'], 70),
('Backend Developer', 'Engineering', ARRAY['Node.js', 'Python', 'Java', 'Database', 'API Development', 'Microservices'], 'Mid-level', ARRAY['backend', 'api', 'database', 'server', 'nodejs', 'python', 'java', 'microservices'], 75),
('Frontend Developer', 'Engineering', ARRAY['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'UI/UX'], 'Mid-level', ARRAY['frontend', 'react', 'javascript', 'html', 'css', 'ui', 'responsive', 'typescript'], 70),
('Full Stack Developer', 'Engineering', ARRAY['React', 'Node.js', 'Database', 'API', 'JavaScript', 'DevOps'], 'Senior', ARRAY['fullstack', 'full-stack', 'react', 'nodejs', 'database', 'api', 'javascript'], 80),
('Data Scientist', 'Data & Analytics', ARRAY['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Analysis', 'AI'], 'Senior', ARRAY['data', 'python', 'machine learning', 'statistics', 'analytics', 'ml', 'ai'], 85),
('DevOps Engineer', 'Engineering', ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Infrastructure'], 'Senior', ARRAY['devops', 'docker', 'kubernetes', 'aws', 'cicd', 'deployment', 'infrastructure'], 80),
('Product Manager', 'Management', ARRAY['Product Strategy', 'Agile', 'Analytics', 'User Research', 'Roadmapping'], 'Senior', ARRAY['product', 'strategy', 'agile', 'scrum', 'analytics', 'roadmap', 'management'], 75),
('UI/UX Designer', 'Design', ARRAY['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'], 'Mid-level', ARRAY['design', 'ui', 'ux', 'figma', 'adobe', 'prototype', 'user experience'], 70);

-- Insert sample job positions
INSERT INTO job_positions (company_id, job_role_id, title, description, requirements, responsibilities, location, employment_type, salary_range, experience_required, skills_required, qualifications, benefits) VALUES
(1, 1, 'Senior QA Engineer - Web Applications', 
 'We are seeking an experienced QA Engineer to join our dynamic team. You will be responsible for ensuring the quality of our web applications through comprehensive testing strategies, automation frameworks, and continuous improvement processes.',
 'Bachelor''s degree in Computer Science or related field. 3+ years of experience in software testing. Strong knowledge of testing methodologies, test case design, and defect management. Experience with automation tools like Selenium, Cypress, or similar. Proficiency in API testing using tools like Postman or REST Assured. Knowledge of Agile/Scrum methodologies.',
 'Design and execute comprehensive test plans and test cases. Develop and maintain automated test scripts. Perform functional, regression, integration, and performance testing. Collaborate with development teams to identify and resolve defects. Participate in code reviews and provide testing feedback. Maintain test documentation and reports.',
 'San Francisco, CA', 'Full-time', '$80,000 - $120,000', '3-5 years',
 ARRAY['Selenium', 'API Testing', 'Test Automation', 'Agile', 'JavaScript', 'Python'],
 ARRAY['Bachelor''s in Computer Science', 'QA Certification preferred'],
 ARRAY['Health Insurance', 'Dental Coverage', '401k Matching', 'Flexible PTO', 'Remote Work Options']),

(1, 2, 'Backend Developer - Node.js & Microservices',
 'Join our backend team to build scalable, high-performance APIs and microservices. You will work on designing and implementing robust backend systems that power our AI-driven recruitment platform.',
 'Bachelor''s degree in Computer Science or equivalent experience. 4+ years of backend development experience. Strong proficiency in Node.js, Express.js, and JavaScript/TypeScript. Experience with microservices architecture and containerization (Docker, Kubernetes). Knowledge of databases (PostgreSQL, MongoDB). Experience with cloud platforms (AWS, GCP, or Azure).',
 'Design and develop RESTful APIs and microservices. Implement database schemas and optimize queries. Build scalable and maintainable backend systems. Collaborate with frontend teams for API integration. Implement security best practices and authentication systems. Monitor and optimize application performance.',
 'Remote', 'Full-time', '$90,000 - $140,000', '4-6 years',
 ARRAY['Node.js', 'Express.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'Microservices'],
 ARRAY['Bachelor''s in Computer Science', 'AWS Certification preferred'],
 ARRAY['Health Insurance', 'Stock Options', 'Learning Budget', 'Flexible Hours', 'Home Office Setup']);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('resume_threshold', '70', 'Minimum resume score to qualify for screening test'),
('final_threshold', '140', 'Minimum combined score to send to HR'),
('test_duration_minutes', '25', 'Time limit for screening test in minutes'),
('hr_email', 'hr@hexaview.com', 'HR team email for notifications'),
('max_file_size_mb', '10', 'Maximum resume file size in MB'),
('ai_analysis_enabled', 'true', 'Enable AI-powered resume analysis'),
('company_name', 'Hexaview Technologies', 'Company name for branding');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(candidate_email);
CREATE INDEX IF NOT EXISTS idx_applications_position ON applications(job_position_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_job_positions_role ON job_positions(job_role_id);
CREATE INDEX IF NOT EXISTS idx_job_positions_active ON job_positions(is_active);
CREATE INDEX IF NOT EXISTS idx_screening_questions_position ON screening_questions(job_position_id);
