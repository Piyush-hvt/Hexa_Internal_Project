import { getSQL } from "./database"

export async function initializeDatabase() {
  try {
    console.log("Checking database schema...")
    const sql = await getSQL()

    if (!sql) {
      console.error("Database connection not available")
      return { success: false, error: "Database connection not available" }
    }

    // Check if admin_users table exists (this is our key table for authentication)
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'admin_users'
      );
    `

    if (tableCheck[0].exists) {
      console.log("Database schema already initialized")
      return { success: true, message: "Database schema already initialized" }
    }

    console.log("Initializing database schema...")

    // Create admin_users table first (for authentication)
    await sql`
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
    `

    // Create companies table
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        website VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create job_roles table
    await sql`
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role_name)
      );
    `

    // Create job_positions table
    await sql`
      CREATE TABLE IF NOT EXISTS job_positions (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        job_role_id INTEGER REFERENCES job_roles(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
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
    `

    // Create applications table
    await sql`
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
    `

    // Create system_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value VARCHAR(255) NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Insert default admin user (password: admin123)
    // Note: In production, you should hash this password properly
    await sql`
      INSERT INTO admin_users (username, password_hash, email) 
      VALUES ('admin', '$2b$10$rOzJqQZJQZJQZJQZJQZJQOzJqQZJQZJQZJQZJQZJQZJQZJQZJQZJQ', 'admin@hexaview.com')
      ON CONFLICT (username) DO NOTHING;
    `

    // Insert default company
    await sql`
      INSERT INTO companies (name, description, website) 
      VALUES ('Hexaview Technologies', 'Leading technology solutions provider specializing in AI-powered recruitment and talent management.', 'https://hexaview.com')
      ON CONFLICT DO NOTHING;
    `

    // Insert default job roles with better conflict handling
    await sql`
      INSERT INTO job_roles (role_name, category, required_skills, experience_level, keywords, resume_threshold)
      VALUES 
        -- QA Roles
        ('QA Engineer', 'QA', ARRAY['Testing', 'Automation', 'Selenium', 'API Testing', 'Bug Tracking'], 'Mid-level', ARRAY['quality', 'testing', 'automation', 'selenium', 'cypress', 'jest'], 70),
        ('QA Analyst', 'QA', ARRAY['Manual Testing', 'Test Cases', 'Bug Reporting', 'Quality Assurance'], 'Entry-level', ARRAY['qa', 'testing', 'quality', 'test cases', 'bug reporting'], 65),
        ('QA Automation Engineer', 'QA', ARRAY['Selenium', 'Cypress', 'TestNG', 'CI/CD', 'API Testing'], 'Mid-level', ARRAY['qa', 'automation', 'selenium', 'cypress', 'api testing', 'ci/cd'], 75),
        ('Senior QA Engineer', 'QA', ARRAY['Test Strategy', 'Team Leadership', 'Automation Frameworks', 'Performance Testing'], 'Senior', ARRAY['senior qa', 'test strategy', 'leadership', 'performance testing'], 80),
        ('QA Lead', 'QA', ARRAY['Test Management', 'Team Leadership', 'Test Planning', 'Quality Metrics'], 'Senior', ARRAY['qa lead', 'test management', 'leadership', 'quality metrics'], 85),
        ('Performance Test Engineer', 'QA', ARRAY['JMeter', 'LoadRunner', 'Performance Testing', 'Load Testing'], 'Mid-level', ARRAY['performance', 'load testing', 'jmeter', 'loadrunner'], 75),
        ('Mobile QA Engineer', 'QA', ARRAY['Mobile Testing', 'Appium', 'iOS Testing', 'Android Testing'], 'Mid-level', ARRAY['mobile testing', 'appium', 'ios', 'android'], 75),
        
        -- Developer Roles
        ('Backend Developer', 'Developer', ARRAY['Node.js', 'Python', 'Java', 'Database', 'API Development'], 'Mid-level', ARRAY['backend', 'api', 'database', 'server', 'nodejs', 'python', 'java'], 75),
        ('Frontend Developer', 'Developer', ARRAY['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'], 'Mid-level', ARRAY['frontend', 'react', 'javascript', 'html', 'css', 'ui', 'responsive'], 70),
        ('Full Stack Developer', 'Developer', ARRAY['React', 'Node.js', 'Database', 'API', 'JavaScript'], 'Senior', ARRAY['fullstack', 'full-stack', 'react', 'nodejs', 'database', 'api'], 80),
        ('Senior Software Engineer', 'Developer', ARRAY['System Design', 'Architecture', 'Mentoring', 'Code Review'], 'Senior', ARRAY['senior developer', 'system design', 'architecture', 'mentoring'], 85),
        ('Mobile Developer', 'Developer', ARRAY['React Native', 'Flutter', 'iOS', 'Android', 'Mobile Apps'], 'Mid-level', ARRAY['mobile', 'react native', 'flutter', 'ios', 'android'], 75),
        
        -- Data Science & Analytics
        ('Data Scientist', 'Data & Analytics', ARRAY['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Analysis'], 'Senior', ARRAY['data', 'python', 'machine learning', 'statistics', 'analytics', 'ml'], 85),
        ('Senior Data Scientist', 'Data & Analytics', ARRAY['Advanced ML', 'Deep Learning', 'Research', 'Team Leadership'], 'Senior', ARRAY['senior data scientist', 'deep learning', 'research', 'leadership'], 90),
        ('Data Analyst', 'Data & Analytics', ARRAY['SQL', 'Excel', 'Tableau', 'Power BI', 'Data Visualization'], 'Mid-level', ARRAY['data analyst', 'sql', 'tableau', 'power bi', 'visualization'], 70),
        ('Business Intelligence Analyst', 'Data & Analytics', ARRAY['BI Tools', 'Data Warehousing', 'ETL', 'Reporting'], 'Mid-level', ARRAY['bi', 'business intelligence', 'etl', 'reporting'], 75),
        ('Data Engineer', 'Data & Analytics', ARRAY['Python', 'Spark', 'Hadoop', 'ETL', 'Data Pipelines'], 'Mid-level', ARRAY['data engineer', 'spark', 'hadoop', 'etl', 'pipelines'], 80),
        ('Machine Learning Engineer', 'Data & Analytics', ARRAY['MLOps', 'TensorFlow', 'PyTorch', 'Model Deployment'], 'Senior', ARRAY['ml engineer', 'mlops', 'tensorflow', 'pytorch'], 85),
        
        -- Salesforce Roles
        ('Salesforce Developer', 'Salesforce', ARRAY['Apex', 'Visualforce', 'Lightning', 'SOQL', 'Salesforce APIs'], 'Mid-level', ARRAY['salesforce', 'apex', 'lightning', 'soql', 'crm'], 75),
        ('Salesforce Administrator', 'Salesforce', ARRAY['Salesforce Admin', 'Workflows', 'Reports', 'Dashboards'], 'Mid-level', ARRAY['salesforce admin', 'workflows', 'reports', 'dashboards'], 70),
        ('Salesforce Architect', 'Salesforce', ARRAY['Solution Architecture', 'Integration', 'Platform Design'], 'Senior', ARRAY['salesforce architect', 'solution architecture', 'integration'], 85),
        ('Salesforce Business Analyst', 'Salesforce', ARRAY['Requirements Analysis', 'Process Design', 'User Stories'], 'Mid-level', ARRAY['salesforce ba', 'requirements', 'process design'], 70),
        ('Salesforce QA Engineer', 'Salesforce', ARRAY['Salesforce Testing', 'Provar', 'Test Automation'], 'Mid-level', ARRAY['salesforce testing', 'provar', 'crm testing'], 75),
        
        -- IT Roles
        ('DevOps Engineer', 'IT', ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'], 'Senior', ARRAY['devops', 'docker', 'kubernetes', 'aws', 'cicd', 'deployment'], 80),
        ('Network Administrator', 'IT', ARRAY['Networking', 'Security', 'Troubleshooting', 'Infrastructure'], 'Mid-level', ARRAY['network', 'infrastructure', 'cisco', 'security', 'vpn', 'firewall'], 75),
        ('System Administrator', 'IT', ARRAY['Windows Server', 'Linux', 'Active Directory', 'Cloud Services'], 'Mid-level', ARRAY['sysadmin', 'windows', 'linux', 'server', 'active directory', 'cloud'], 75),
        ('IT Support Specialist', 'IT', ARRAY['Troubleshooting', 'Hardware', 'Software', 'Customer Service'], 'Entry-level', ARRAY['it support', 'helpdesk', 'troubleshooting', 'technical support'], 65),
        ('Cloud Engineer', 'IT', ARRAY['AWS', 'Azure', 'GCP', 'Cloud Architecture', 'Infrastructure'], 'Mid-level', ARRAY['cloud', 'aws', 'azure', 'gcp', 'infrastructure'], 80),
        ('Security Engineer', 'IT', ARRAY['Cybersecurity', 'Penetration Testing', 'Security Audits'], 'Senior', ARRAY['security', 'cybersecurity', 'penetration testing', 'audits'], 85),
        ('Database Administrator', 'IT', ARRAY['SQL Server', 'MySQL', 'PostgreSQL', 'Database Optimization'], 'Mid-level', ARRAY['dba', 'database', 'sql server', 'mysql', 'postgresql'], 75),
        
        -- HR Roles
        ('HR Manager', 'HR', ARRAY['Recruitment', 'Employee Relations', 'Performance Management', 'Compensation'], 'Senior', ARRAY['hr', 'human resources', 'recruitment', 'hiring', 'onboarding', 'benefits'], 75),
        ('HR Specialist', 'HR', ARRAY['Recruitment', 'Onboarding', 'Benefits Administration', 'HRIS'], 'Mid-level', ARRAY['hr', 'recruitment', 'onboarding', 'benefits', 'hris'], 70),
        ('HR Business Partner', 'HR', ARRAY['Strategic HR', 'Change Management', 'Organizational Development'], 'Senior', ARRAY['hr business partner', 'strategic hr', 'change management'], 80),
        ('Talent Acquisition Specialist', 'HR', ARRAY['Recruiting', 'Sourcing', 'Interviewing', 'Candidate Experience'], 'Mid-level', ARRAY['talent acquisition', 'recruiting', 'sourcing', 'interviewing'], 70),
        ('HR Generalist', 'HR', ARRAY['General HR', 'Policy Development', 'Employee Relations'], 'Mid-level', ARRAY['hr generalist', 'policy', 'employee relations'], 70),
        ('Compensation Analyst', 'HR', ARRAY['Compensation Analysis', 'Market Research', 'Pay Equity'], 'Mid-level', ARRAY['compensation', 'pay equity', 'market research'], 75),
        ('Learning & Development Specialist', 'HR', ARRAY['Training Design', 'Learning Management', 'Employee Development'], 'Mid-level', ARRAY['learning development', 'training', 'employee development'], 70),
        
        -- Design & Management
        ('Product Manager', 'Management', ARRAY['Product Strategy', 'Agile', 'Analytics', 'User Research'], 'Senior', ARRAY['product', 'strategy', 'agile', 'scrum', 'analytics', 'roadmap'], 75),
        ('UI/UX Designer', 'Design', ARRAY['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'], 'Mid-level', ARRAY['design', 'ui', 'ux', 'figma', 'adobe', 'prototype', 'user experience'], 70),
        ('Technical Project Manager', 'Management', ARRAY['Project Management', 'Agile', 'Technical Leadership'], 'Senior', ARRAY['project manager', 'agile', 'technical leadership'], 80)
      ON CONFLICT (role_name) DO UPDATE SET
        category = EXCLUDED.category,
        required_skills = EXCLUDED.required_skills,
        experience_level = EXCLUDED.experience_level,
        keywords = EXCLUDED.keywords,
        resume_threshold = EXCLUDED.resume_threshold,
        updated_at = CURRENT_TIMESTAMP;
    `

    // Insert default system settings
    await sql`
      INSERT INTO system_settings (setting_key, setting_value, description) 
      VALUES 
        ('resume_threshold', '70', 'Minimum resume score to qualify for screening test'),
        ('final_threshold', '140', 'Minimum combined score to send to HR'),
        ('test_duration_minutes', '25', 'Time limit for screening test in minutes'),
        ('hr_email', 'hr@hexaview.com', 'HR team email for notifications'),
        ('max_file_size_mb', '10', 'Maximum resume file size in MB'),
        ('ai_analysis_enabled', 'true', 'Enable AI-powered resume analysis'),
        ('company_name', 'Hexaview Technologies', 'Company name for branding')
      ON CONFLICT (setting_key) DO NOTHING;
    `

    console.log("Database schema initialized successfully")
    return { success: true, message: "Database schema initialized successfully" }
  } catch (error) {
    console.error("Error initializing database schema:", error)
    return { success: false, error: `Error initializing database schema: ${error}` }
  }
}
