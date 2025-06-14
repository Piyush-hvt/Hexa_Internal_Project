-- Create database schema for resume screening application

-- Applications table to store candidate submissions
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    job_role VARCHAR(100) NOT NULL,
    resume_file_path VARCHAR(500),
    resume_score INTEGER DEFAULT 0,
    screening_score INTEGER DEFAULT 0,
    final_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job roles configuration table
CREATE TABLE IF NOT EXISTS job_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    required_skills TEXT[],
    experience_level VARCHAR(50),
    keywords TEXT[],
    resume_threshold INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Screening questions table
CREATE TABLE IF NOT EXISTS screening_questions (
    id SERIAL PRIMARY KEY,
    job_role_id INTEGER REFERENCES job_roles(id),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'medium',
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

-- Insert default job roles
INSERT INTO job_roles (role_name, required_skills, experience_level, keywords, resume_threshold) VALUES
('QA Engineer', ARRAY['Testing', 'Automation', 'Selenium', 'API Testing', 'Bug Tracking'], 'Mid-level', ARRAY['quality', 'testing', 'automation', 'selenium', 'cypress', 'jest'], 70),
('Backend Developer', ARRAY['Node.js', 'Python', 'Java', 'Database', 'API Development'], 'Mid-level', ARRAY['backend', 'api', 'database', 'server', 'nodejs', 'python', 'java'], 75),
('Frontend Developer', ARRAY['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'], 'Mid-level', ARRAY['frontend', 'react', 'javascript', 'html', 'css', 'ui', 'responsive'], 70),
('Full Stack Developer', ARRAY['React', 'Node.js', 'Database', 'API', 'JavaScript'], 'Senior', ARRAY['fullstack', 'full-stack', 'react', 'nodejs', 'database', 'api'], 80),
('Data Scientist', ARRAY['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Analysis'], 'Senior', ARRAY['data', 'python', 'machine learning', 'statistics', 'analytics', 'ml'], 85),
('DevOps Engineer', ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'], 'Senior', ARRAY['devops', 'docker', 'kubernetes', 'aws', 'cicd', 'deployment'], 80),
('Product Manager', ARRAY['Product Strategy', 'Agile', 'Analytics', 'User Research'], 'Senior', ARRAY['product', 'strategy', 'agile', 'scrum', 'analytics', 'roadmap'], 75),
('UI/UX Designer', ARRAY['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'], 'Mid-level', ARRAY['design', 'ui', 'ux', 'figma', 'adobe', 'prototype', 'user experience'], 70);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('resume_threshold', '70', 'Minimum resume score to qualify for screening test'),
('final_threshold', '140', 'Minimum combined score to send to HR'),
('test_duration_minutes', '15', 'Time limit for screening test in minutes'),
('hr_email', 'hr@company.com', 'HR team email for notifications'),
('max_file_size_mb', '10', 'Maximum resume file size in MB');

-- Insert comprehensive screening questions for QA Engineer (15 questions)
INSERT INTO screening_questions (job_role_id, question_text, options, correct_answer, difficulty_level) VALUES
-- QA Engineer Questions
(1, 'What is the primary purpose of unit testing?', 
 '["To test the entire application", "To test individual components in isolation", "To test user interface", "To test database connections"]', 
 1, 'easy'),
(1, 'Which testing approach tests the application without knowledge of internal code structure?', 
 '["White box testing", "Black box testing", "Gray box testing", "Integration testing"]', 
 1, 'medium'),
(1, 'What does API stand for in software testing?', 
 '["Application Programming Interface", "Advanced Programming Integration", "Automated Program Interaction", "Application Process Integration"]', 
 0, 'easy'),
(1, 'Which HTTP status code indicates a successful request?', 
 '["404", "500", "200", "301"]', 
 2, 'easy'),
(1, 'In Agile methodology, what is a Sprint?', 
 '["A type of testing", "A time-boxed iteration", "A project milestone", "A team meeting"]', 
 1, 'medium'),
(1, 'What is the difference between smoke testing and sanity testing?', 
 '["No difference, they are the same", "Smoke testing is broader, sanity testing is narrow and focused", "Sanity testing is broader, smoke testing is narrow", "Both are performed only on production"]', 
 1, 'medium'),
(1, 'Which automation tool is primarily used for web application testing?', 
 '["JUnit", "Selenium", "Postman", "Jenkins"]', 
 1, 'easy'),
(1, 'What is a test case?', 
 '["A bug report", "A set of conditions to determine if a system works correctly", "A testing tool", "A type of documentation"]', 
 1, 'easy'),
(1, 'In testing, what does UAT stand for?', 
 '["Unit Acceptance Testing", "User Acceptance Testing", "Unified Application Testing", "Universal Access Testing"]', 
 1, 'medium'),
(1, 'What is regression testing?', 
 '["Testing new features only", "Re-testing the entire application from scratch", "Testing to ensure existing functionality works after changes", "Testing for performance issues"]', 
 2, 'medium'),
(1, 'Which testing type focuses on the application''s ability to handle expected load?', 
 '["Functional testing", "Security testing", "Performance testing", "Usability testing"]', 
 2, 'medium'),
(1, 'What is a defect life cycle?', 
 '["The time taken to fix a bug", "The process a defect goes through from discovery to closure", "The number of defects in a release", "The cost of fixing defects"]', 
 1, 'hard'),
(1, 'In API testing, what does POST method typically do?', 
 '["Retrieve data", "Update existing data", "Create new data", "Delete data"]', 
 2, 'medium'),
(1, 'What is boundary value analysis?', 
 '["Testing only maximum values", "Testing values at the boundaries of input domains", "Testing random values", "Testing only minimum values"]', 
 1, 'hard'),
(1, 'Which tool is commonly used for API testing?', 
 '["Selenium", "Postman", "JMeter", "TestNG"]', 
 1, 'easy');

-- Backend Developer Questions (15 questions)
INSERT INTO screening_questions (job_role_id, question_text, options, correct_answer, difficulty_level) VALUES
(2, 'What is REST in web development?', 
 '["A programming language", "Representational State Transfer - an architectural style", "A database management system", "A testing framework"]', 
 1, 'medium'),
(2, 'Which HTTP method is idempotent?', 
 '["POST", "GET", "PATCH", "All of the above"]', 
 1, 'medium'),
(2, 'What is the purpose of middleware in Express.js?', 
 '["To handle database connections", "To execute code during request-response cycle", "To manage user authentication only", "To handle file uploads only"]', 
 1, 'medium'),
(2, 'What does ACID stand for in database transactions?', 
 '["Atomicity, Consistency, Isolation, Durability", "Authentication, Consistency, Integration, Data", "Atomicity, Concurrency, Isolation, Distribution", "Authentication, Concurrency, Integration, Durability"]', 
 0, 'hard'),
(2, 'Which status code indicates a server error?', 
 '["200", "404", "500", "301"]', 
 2, 'easy'),
(2, 'What is the difference between SQL and NoSQL databases?', 
 '["No difference", "SQL uses structured data, NoSQL uses unstructured/semi-structured data", "NoSQL is faster than SQL", "SQL is newer than SQL"]', 
 1, 'medium'),
(2, 'What is JWT?', 
 '["Java Web Token", "JSON Web Token", "JavaScript Web Tool", "Java Web Tool"]', 
 1, 'medium'),
(2, 'In Node.js, what is the event loop?', 
 '["A debugging tool", "A mechanism that handles asynchronous operations", "A type of database", "A testing framework"]', 
 1, 'hard'),
(2, 'What is the purpose of indexing in databases?', 
 '["To backup data", "To improve query performance", "To encrypt data", "To compress data"]', 
 1, 'medium'),
(2, 'What does CORS stand for?', 
 '["Cross-Origin Resource Sharing", "Cross-Origin Request Security", "Cross-Origin Resource Security", "Cross-Origin Request Sharing"]', 
 0, 'medium'),
(2, 'Which design pattern is commonly used in backend development for dependency injection?', 
 '["Singleton", "Factory", "Observer", "Dependency Injection Container"]', 
 3, 'hard'),
(2, 'What is the difference between authentication and authorization?', 
 '["No difference", "Authentication verifies identity, authorization determines permissions", "Authorization verifies identity, authentication determines permissions", "Both are the same process"]', 
 1, 'medium'),
(2, 'What is a microservice architecture?', 
 '["A single large application", "An architectural approach with small, independent services", "A type of database", "A programming language"]', 
 1, 'hard'),
(2, 'In RESTful APIs, what does the PUT method typically do?', 
 '["Create new resource", "Update or create a resource", "Delete a resource", "Retrieve a resource"]', 
 1, 'medium'),
(2, 'What is caching in backend development?', 
 '["Storing data temporarily for faster access", "Deleting old data", "Encrypting sensitive data", "Backing up databases"]', 
 0, 'medium');

-- Frontend Developer Questions (15 questions)
INSERT INTO screening_questions (job_role_id, question_text, options, correct_answer, difficulty_level) VALUES
(3, 'What is the Virtual DOM in React?', 
 '["A real DOM element", "A JavaScript representation of the real DOM", "A database", "A CSS framework"]', 
 1, 'medium'),
(3, 'Which CSS property is used to make a layout responsive?', 
 '["position", "display", "media queries", "float"]', 
 2, 'easy'),
(3, 'What is the difference between let, const, and var in JavaScript?', 
 '["No difference", "Different scoping rules and mutability", "Different data types", "Different performance characteristics"]', 
 1, 'medium'),
(3, 'What is a closure in JavaScript?', 
 '["A type of loop", "A function that has access to outer scope variables", "A CSS property", "A HTML element"]', 
 1, 'hard'),
(3, 'Which hook is used for side effects in React?', 
 '["useState", "useEffect", "useContext", "useReducer"]', 
 1, 'medium'),
(3, 'What is the purpose of semantic HTML?', 
 '["To make pages load faster", "To provide meaning and structure to content", "To add styling", "To handle JavaScript events"]', 
 1, 'medium'),
(3, 'What is the difference between == and === in JavaScript?', 
 '["No difference", "== checks type and value, === checks only value", "=== checks type and value, == checks only value", "=== is faster than =="]', 
 2, 'easy'),
(3, 'What is CSS Grid used for?', 
 '["Adding animations", "Creating two-dimensional layouts", "Handling events", "Managing state"]', 
 1, 'medium'),
(3, 'What is the purpose of React keys?', 
 '["To encrypt data", "To help React identify which items have changed", "To style components", "To handle events"]', 
 1, 'medium'),
(3, 'What is a Promise in JavaScript?', 
 '["A type of variable", "An object representing eventual completion of an asynchronous operation", "A CSS property", "A HTML element"]', 
 1, 'hard'),
(3, 'Which CSS property controls the stacking order of elements?', 
 '["position", "display", "z-index", "float"]', 
 2, 'easy'),
(3, 'What is the difference between margin and padding in CSS?', 
 '["No difference", "Margin is outside the element, padding is inside", "Padding is outside the element, margin is inside", "Both are the same"]', 
 1, 'easy'),
(3, 'What is event bubbling in JavaScript?', 
 '["A type of animation", "Events propagating from child to parent elements", "A debugging technique", "A CSS property"]', 
 1, 'medium'),
(3, 'What is the purpose of webpack?', 
 '["To test applications", "To bundle and optimize assets", "To manage databases", "To handle authentication"]', 
 1, 'medium'),
(3, 'What is TypeScript?', 
 '["A CSS framework", "A superset of JavaScript with static typing", "A database", "A testing tool"]', 
 1, 'medium');

-- Full Stack Developer Questions (15 questions)
INSERT INTO screening_questions (job_role_id, question_text, options, correct_answer, difficulty_level) VALUES
(4, 'What is the main advantage of using a full-stack framework?', 
 '["Better performance", "Unified development experience across frontend and backend", "Lower cost", "Easier deployment"]', 
 1, 'medium'),
(4, 'In a typical web application architecture, what is the role of a reverse proxy?', 
 '["To cache database queries", "To route requests and provide load balancing", "To compile frontend code", "To manage user sessions"]', 
 1, 'hard'),
(4, 'What is the difference between server-side rendering (SSR) and client-side rendering (CSR)?', 
 '["No difference", "SSR renders on server, CSR renders in browser", "CSR is always faster", "SSR only works with databases"]', 
 1, 'medium'),
(4, 'What is GraphQL?', 
 '["A database", "A query language for APIs", "A CSS framework", "A testing tool"]', 
 1, 'medium'),
(4, 'What is the purpose of environment variables?', 
 '["To store user data", "To configure application settings without hardcoding", "To improve performance", "To handle errors"]', 
 1, 'medium'),
(4, 'What is containerization in software development?', 
 '["A testing method", "Packaging applications with their dependencies", "A database technique", "A CSS methodology"]', 
 1, 'hard'),
(4, 'What is the difference between horizontal and vertical scaling?', 
 '["No difference", "Horizontal adds more servers, vertical adds more power to existing servers", "Vertical adds more servers, horizontal adds more power", "Both are the same"]', 
 1, 'hard'),
(4, 'What is CI/CD?', 
 '["A programming language", "Continuous Integration/Continuous Deployment", "A database system", "A testing framework"]', 
 1, 'medium'),
(4, 'What is the purpose of a CDN (Content Delivery Network)?', 
 '["To store databases", "To deliver content from geographically distributed servers", "To compile code", "To manage user authentication"]', 
 1, 'medium'),
(4, 'What is the difference between monolithic and microservices architecture?', 
 '["No difference", "Monolithic is single deployable unit, microservices are independent services", "Microservices are always better", "Monolithic is newer"]', 
 1, 'hard'),
(4, 'What is OAuth?', 
 '["A database", "An authorization framework", "A CSS framework", "A testing tool"]', 
 1, 'medium'),
(4, 'What is the purpose of load balancing?', 
 '["To reduce code size", "To distribute incoming requests across multiple servers", "To improve code quality", "To manage databases"]', 
 1, 'medium'),
(4, 'What is WebSocket?', 
 '["A CSS property", "A protocol for real-time bidirectional communication", "A database type", "A testing framework"]', 
 1, 'medium'),
(4, 'What is the difference between SQL injection and XSS attacks?', 
 '["No difference", "SQL injection targets databases, XSS targets client-side scripts", "XSS targets databases, SQL injection targets scripts", "Both are the same"]', 
 1, 'hard'),
(4, 'What is the purpose of API versioning?', 
 '["To improve performance", "To maintain backward compatibility while evolving APIs", "To reduce server load", "To handle authentication"]', 
 1, 'medium');

-- Data Scientist Questions (15 questions)
INSERT INTO screening_questions (job_role_id, question_text, options, correct_answer, difficulty_level) VALUES
(5, 'What is the difference between supervised and unsupervised learning?', 
 '["No difference", "Supervised uses labeled data, unsupervised uses unlabeled data", "Unsupervised is always better", "Supervised is faster"]', 
 1, 'medium'),
(5, 'What is overfitting in machine learning?', 
 '["Model performs well on all data", "Model performs well on training data but poorly on new data", "Model performs poorly on all data", "Model is too simple"]', 
 1, 'medium'),
(5, 'Which Python library is commonly used for data manipulation?', 
 '["NumPy", "Pandas", "Matplotlib", "Scikit-learn"]', 
 1, 'easy'),
(5, 'What is the purpose of cross-validation?', 
 '["To clean data", "To assess model performance and generalization", "To visualize data", "To collect data"]', 
 1, 'medium'),
(5, 'What is the difference between correlation and causation?', 
 '["No difference", "Correlation shows relationship, causation shows cause-effect", "Causation is stronger than correlation", "Both are the same"]', 
 1, 'medium'),
(5, 'What is a p-value in statistics?', 
 '["The probability of the hypothesis being true", "The probability of observing results given null hypothesis is true", "The confidence level", "The sample size"]', 
 1, 'hard'),
(5, 'Which algorithm is best for classification problems?', 
 '["Linear Regression", "Decision Trees, SVM, Random Forest", "K-means", "PCA"]', 
 1, 'medium'),
(5, 'What is feature engineering?', 
 '["Collecting data", "Creating new features from existing data to improve model performance", "Cleaning data", "Visualizing data"]', 
 1, 'medium'),
(5, 'What is the curse of dimensionality?', 
 '["Too little data", "Problems that arise when working with high-dimensional data", "Too much data", "Data quality issues"]', 
 1, 'hard'),
(5, 'What is the difference between Type I and Type II errors?', 
 '["No difference", "Type I is false positive, Type II is false negative", "Type I is false negative, Type II is false positive", "Both are the same"]', 
 1, 'hard'),
(5, 'What is regularization in machine learning?', 
 '["Data cleaning technique", "Technique to prevent overfitting by adding penalty terms", "Data visualization method", "Feature selection method"]', 
 1, 'medium'),
(5, 'What is the purpose of normalization in data preprocessing?', 
 '["To remove outliers", "To scale features to similar ranges", "To add new features", "To remove missing values"]', 
 1, 'medium'),
(5, 'What is ensemble learning?', 
 '["Using single model", "Combining multiple models to improve performance", "Data cleaning technique", "Feature selection method"]', 
 1, 'medium'),
(5, 'What is the difference between bagging and boosting?', 
 '["No difference", "Bagging trains models in parallel, boosting trains sequentially", "Boosting is always better", "Bagging is newer"]', 
 1, 'hard'),
(5, 'What is A/B testing?', 
 '["A type of machine learning", "Comparing two versions to determine which performs better", "A data visualization technique", "A database query method"]', 
 1, 'medium');

-- DevOps Engineer Questions (15 questions)
INSERT INTO screening_questions (job_role_id, question_text, options, correct_answer, difficulty_level) VALUES
(6, 'What is the main purpose of containerization?', 
 '["To improve security", "To package applications with their dependencies for consistent deployment", "To reduce code size", "To improve performance"]', 
 1, 'medium'),
(6, 'What is the difference between Docker and Kubernetes?', 
 '["No difference", "Docker is containerization platform, Kubernetes is orchestration platform", "Kubernetes is newer", "Docker is better"]', 
 1, 'medium'),
(6, 'What does CI/CD stand for?', 
 '["Continuous Integration/Continuous Deployment", "Continuous Improvement/Continuous Development", "Continuous Integration/Continuous Development", "Continuous Improvement/Continuous Deployment"]', 
 0, 'easy'),
(6, 'What is Infrastructure as Code (IaC)?', 
 '["Writing application code", "Managing infrastructure through code and automation", "A programming language", "A testing methodology"]', 
 1, 'medium'),
(6, 'Which tool is commonly used for configuration management?', 
 '["Docker", "Ansible", "Git", "Jenkins"]', 
 1, 'medium'),
(6, 'What is the purpose of load balancing?', 
 '["To reduce server costs", "To distribute traffic across multiple servers", "To improve code quality", "To manage databases"]', 
 1, 'medium'),
(6, 'What is monitoring in DevOps?', 
 '["Code review process", "Observing system performance and health", "Testing applications", "Managing user accounts"]', 
 1, 'medium'),
(6, 'What is the difference between horizontal and vertical scaling?', 
 '["No difference", "Horizontal adds more instances, vertical increases instance capacity", "Vertical adds more instances, horizontal increases capacity", "Both are the same"]', 
 1, 'medium'),
(6, 'What is a microservice architecture?', 
 '["A single large application", "Architecture with small, independent, loosely coupled services", "A database design pattern", "A testing strategy"]', 
 1, 'hard'),
(6, 'What is the purpose of version control in DevOps?', 
 '["To improve performance", "To track changes and collaborate on code", "To deploy applications", "To monitor systems"]', 
 1, 'easy'),
(6, 'What is blue-green deployment?', 
 '["A color coding system", "Deployment strategy using two identical environments", "A testing methodology", "A monitoring technique"]', 
 1, 'hard'),
(6, 'What is the purpose of automated testing in CI/CD?', 
 '["To slow down deployment", "To catch bugs early and ensure code quality", "To increase costs", "To complicate processes"]', 
 1, 'medium'),
(6, 'What is container orchestration?', 
 '["Manual container management", "Automated management of containerized applications", "A programming language", "A database technique"]', 
 1, 'medium'),
(6, 'What is the difference between public, private, and hybrid cloud?', 
 '["No difference", "Public is shared, private is dedicated, hybrid combines both", "Private is always better", "Public is more secure"]', 
 1, 'medium'),
(6, 'What is the purpose of logging in DevOps?', 
 '["To slow down applications", "To record events for debugging and monitoring", "To increase storage costs", "To complicate deployment"]', 
 1, 'medium');

-- Product Manager Questions (15 questions)
INSERT INTO screening_questions (job_role_id, question_text, options, correct_answer, difficulty_level) VALUES
(7, 'What is the primary role of a Product Manager?', 
 '["To write code", "To define product strategy and guide development", "To manage finances", "To handle customer support"]', 
 1, 'easy'),
(7, 'What is an MVP (Minimum Viable Product)?', 
 '["The most expensive product", "A product with minimum features to validate assumptions", "A perfect product", "A product for VIP customers"]', 
 1, 'medium'),
(7, 'What is the difference between Agile and Waterfall methodologies?', 
 '["No difference", "Agile is iterative, Waterfall is sequential", "Waterfall is newer", "Agile is always better"]', 
 1, 'medium'),
(7, 'What is a user story in Agile development?', 
 '["A bug report", "A short description of a feature from user perspective", "A technical specification", "A project timeline"]', 
 1, 'medium'),
(7, 'What is the purpose of A/B testing in product management?', 
 '["To find bugs", "To compare different versions and measure impact", "To improve code quality", "To reduce costs"]', 
 1, 'medium'),
(7, 'What is a product roadmap?', 
 '["A geographical map", "A strategic plan showing product development over time", "A technical diagram", "A user manual"]', 
 1, 'medium'),
(7, 'What does KPI stand for?', 
 '["Key Performance Indicator", "Key Product Information", "Key Process Improvement", "Key Performance Index"]', 
 0, 'easy'),
(7, 'What is customer segmentation?', 
 '["Dividing code into segments", "Grouping customers based on shared characteristics", "A testing methodology", "A design pattern"]', 
 1, 'medium'),
(7, 'What is the difference between features and benefits?', 
 '["No difference", "Features are what product does, benefits are value to users", "Benefits are technical, features are business", "Both are the same"]', 
 1, 'medium'),
(7, 'What is product-market fit?', 
 '["A marketing strategy", "When product satisfies strong market demand", "A pricing model", "A development methodology"]', 
 1, 'hard'),
(7, 'What is the purpose of user personas?', 
 '["To write code", "To represent target users and guide product decisions", "To manage databases", "To handle payments"]', 
 1, 'medium'),
(7, 'What is technical debt in product development?', 
 '["Financial debt", "Cost of additional work caused by choosing easy solution over better approach", "User complaints", "Marketing expenses"]', 
 1, 'hard'),
(7, 'What is the difference between qualitative and quantitative research?', 
 '["No difference", "Qualitative explores why, quantitative measures what", "Quantitative is always better", "Qualitative uses only numbers"]', 
 1, 'medium'),
(7, 'What is a sprint in Agile methodology?', 
 '["A type of meeting", "A time-boxed iteration for development work", "A testing phase", "A deployment process"]', 
 1, 'medium'),
(7, 'What is the purpose of stakeholder management?', 
 '["To reduce costs", "To align different parties toward common product goals", "To write documentation", "To handle technical issues"]', 
 1, 'medium');

-- UI/UX Designer Questions (15 questions)
INSERT INTO screening_questions (job_role_id, question_text, options, correct_answer, difficulty_level) VALUES
(8, 'What is the difference between UI and UX design?', 
 '["No difference", "UI focuses on interface, UX focuses on overall user experience", "UX is newer than UI", "UI is more important"]', 
 1, 'easy'),
(8, 'What is a wireframe in design?', 
 '["A final design", "A low-fidelity structural blueprint of a page", "A color palette", "A font selection"]', 
 1, 'medium'),
(8, 'What is the purpose of user personas?', 
 '["To create artwork", "To represent target users and guide design decisions", "To choose colors", "To write code"]', 
 1, 'medium'),
(8, 'What is responsive design?', 
 '["Fast loading design", "Design that adapts to different screen sizes", "Interactive design", "Colorful design"]', 
 1, 'easy'),
(8, 'What is the principle of visual hierarchy?', 
 '["Using only one color", "Arranging elements to guide user attention", "Making everything the same size", "Using complex layouts"]', 
 1, 'medium'),
(8, 'What is A/B testing in UX design?', 
 '["Testing two colors", "Comparing two design versions to see which performs better", "Testing on two devices", "Testing with two users"]', 
 1, 'medium'),
(8, 'What is the purpose of prototyping?', 
 '["To create final product", "To test and validate design concepts before development", "To choose fonts", "To create documentation"]', 
 1, 'medium'),
(8, 'What is accessibility in web design?', 
 '["Making sites load faster", "Designing for users with disabilities", "Making sites look better", "Reducing development time"]', 
 1, 'medium'),
(8, 'What is the 60-30-10 rule in color theory?', 
 '["A pricing model", "A color distribution rule: 60% dominant, 30% secondary, 10% accent", "A font sizing rule", "A layout principle"]', 
 1, 'medium'),
(8, 'What is user journey mapping?', 
 '["Creating site maps", "Visualizing user interactions across touchpoints", "Drawing wireframes", "Choosing color schemes"]', 
 1, 'medium'),
(8, 'What is the difference between serif and sans-serif fonts?', 
 '["No difference", "Serif has decorative strokes, sans-serif does not", "Sans-serif is newer", "Serif is always better"]', 
 1, 'easy'),
(8, 'What is the purpose of white space in design?', 
 '["To save ink", "To improve readability and create visual breathing room", "To reduce file size", "To make designs look empty"]', 
 1, 'medium'),
(8, 'What is information architecture?', 
 '["Building design", "Organizing and structuring content for usability", "Color theory", "Font selection"]', 
 1, 'medium'),
(8, 'What is the F-pattern in web design?', 
 '["A layout shape", "How users typically scan web content", "A color scheme", "A font style"]', 
 1, 'medium'),
(8, 'What is the purpose of usability testing?', 
 '["To test code", "To evaluate how easy and intuitive a design is for users", "To check colors", "To validate technical requirements"]', 
 1, 'medium');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(candidate_email);
CREATE INDEX IF NOT EXISTS idx_applications_job_role ON applications(job_role);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_screening_questions_job_role ON screening_questions(job_role_id);
