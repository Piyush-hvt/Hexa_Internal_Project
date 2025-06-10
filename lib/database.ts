// Only initialize if DATABASE_URL is available
let sql: any = null

async function initializeDatabase() {
  if (process.env.DATABASE_URL && !sql) {
    try {
      const { neon, neonConfig } = await import("@neondatabase/serverless")

      // Configure Neon for optimal performance
      neonConfig.fetchConnectionCache = true

      // Create SQL query function
      sql = neon(process.env.DATABASE_URL)

      console.log("Database connection initialized successfully")
      return sql
    } catch (error) {
      console.error("Failed to initialize database connection:", error)
      return null
    }
  }
  return sql
}

// Export a function that ensures database is initialized
export async function getSQL() {
  if (!sql && process.env.DATABASE_URL) {
    return await initializeDatabase()
  }
  return sql
}

// For backward compatibility, export sql directly but it might be null
export { sql }

// Demo data for when database is not available
export const demoJobRoles = [
  { id: 1, role_name: "QA Engineer", category: "Engineering" },
  { id: 2, role_name: "Backend Developer", category: "Engineering" },
  { id: 3, role_name: "Frontend Developer", category: "Engineering" },
  { id: 4, role_name: "Full Stack Developer", category: "Engineering" },
  { id: 5, role_name: "Data Scientist", category: "Data & Analytics" },
  { id: 6, role_name: "DevOps Engineer", category: "Engineering" },
  { id: 7, role_name: "Product Manager", category: "Management" },
  { id: 8, role_name: "UI/UX Designer", category: "Design" },
]

// Helper function to check if database is connected
export function isDatabaseConnected() {
  return !!sql && !!process.env.DATABASE_URL
}

// Database types
export interface JobRole {
  id: number
  role_name: string
  category: string
  required_skills: string[]
  experience_level: string
  keywords: string[]
  resume_threshold: number
  is_active: boolean
}

export interface JobPosition {
  id: number
  company_id: number
  job_role_id: number
  title: string
  description: string
  requirements: string
  responsibilities: string
  location: string
  employment_type: string
  salary_range: string
  experience_required: string
  skills_required: string[]
  qualifications: string[]
  benefits: string[]
  application_deadline: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Application {
  id: number
  candidate_name: string
  candidate_email: string
  candidate_phone: string | null
  job_position_id: number
  resume_file_path: string | null
  resume_text: string | null
  resume_score: number
  screening_score: number
  final_score: number
  status: string
  analysis_details: any
  submitted_at: string
  completed_at: string | null
}

export interface Company {
  id: number
  name: string
  description: string | null
  website: string | null
  is_active: boolean
}

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
}
