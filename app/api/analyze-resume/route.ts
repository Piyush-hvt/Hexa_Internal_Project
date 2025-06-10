import { type NextRequest, NextResponse } from "next/server"
import { getSQL } from "@/lib/database"
import { analyzeResume } from "@/lib/resume-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobPositionId, candidateData } = await request.json()

    // Validate resume text
    if (!resumeText || resumeText.trim() === "") {
      return NextResponse.json({ error: "Resume text is required", success: false }, { status: 400 })
    }

    console.log(`Analyzing resume for position ${jobPositionId}. Resume length: ${resumeText.length} characters`)

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.log("Database not configured, using direct analysis")

      // Even without database, we can still analyze the resume against a mock position
      const mockPosition = {
        id: Number.parseInt(jobPositionId) || 1,
        company_id: 1,
        job_role_id: 1,
        title: "Software Developer",
        description: "Developing software applications using modern technologies.",
        requirements: "Experience with JavaScript, React, and Node.js. Strong problem-solving skills.",
        responsibilities: "Develop and maintain web applications, collaborate with team members.",
        location: "Remote",
        employment_type: "Full-time",
        salary_range: "Competitive",
        experience_required: "3+ years",
        skills_required: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
        qualifications: ["Bachelor's degree in Computer Science or related field"],
        benefits: ["Health insurance", "Remote work", "Flexible hours"],
        application_deadline: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Use our AI-enhanced analyzer
      const analysis = await analyzeResume(resumeText, mockPosition)

      return NextResponse.json({
        success: true,
        application: {
          id: Date.now(),
          name: candidateData.name,
          email: candidateData.email,
          jobPositionId: jobPositionId,
          resumeScore: analysis.score,
          analysis,
          submittedAt: new Date().toISOString(),
          jobTitle: mockPosition.title,
          threshold: 70,
        },
        note: "Using AI-powered analysis - database not configured",
      })
    }

    try {
      // Try to use database
      const sql = await getSQL()
      if (!sql) {
        throw new Error("Database connection not available")
      }

      // Get job position details with all required fields
      const positions = await sql`
        SELECT 
          jp.*, 
          jr.role_name, 
          jr.required_skills, 
          jr.keywords, 
          jr.resume_threshold
        FROM job_positions jp
        JOIN job_roles jr ON jp.job_role_id = jr.id
        WHERE jp.id = ${jobPositionId}
      `

      if (positions.length === 0) {
        return NextResponse.json({ error: "Job position not found", success: false }, { status: 404 })
      }

      const jobPosition = positions[0]
      console.log("Job position found:", jobPosition.title)

      // Ensure skills_required is an array
      if (typeof jobPosition.skills_required === "string") {
        try {
          jobPosition.skills_required = JSON.parse(jobPosition.skills_required)
        } catch (e) {
          jobPosition.skills_required = jobPosition.skills_required.split(",").map((s: string) => s.trim())
        }
      }

      // If still not an array, create a default
      if (!Array.isArray(jobPosition.skills_required)) {
        console.log("Converting skills to array")
        jobPosition.skills_required = []
      }

      console.log(`Skills required: ${jobPosition.skills_required.join(", ")}`)

      // Use our AI-enhanced analyzer
      const analysis = await analyzeResume(resumeText, jobPosition)
      console.log("AI Analysis complete. Score:", analysis.score)

      // Create application record
      const applications = await sql`
        INSERT INTO applications (
          candidate_name, candidate_email, candidate_phone, job_position_id,
          resume_text, resume_score, analysis_details, status
        ) VALUES (
          ${candidateData.name}, ${candidateData.email}, ${candidateData.phone || null},
          ${jobPositionId}, ${resumeText}, ${analysis.score}, ${JSON.stringify(analysis)}, 'resume_analyzed'
        ) RETURNING *
      `

      const application = applications[0]
      console.log("Application saved with ID:", application.id)

      return NextResponse.json({
        success: true,
        application: {
          id: application.id,
          name: application.candidate_name,
          email: application.candidate_email,
          jobPositionId: application.job_position_id,
          resumeScore: application.resume_score,
          analysis,
          submittedAt: application.submitted_at,
          jobTitle: jobPosition.title,
          threshold: jobPosition.resume_threshold || 70,
        },
      })
    } catch (dbError) {
      console.error("Database error, using direct analysis:", dbError)

      // Even with database error, we can still analyze the resume
      const mockPosition = {
        id: Number.parseInt(jobPositionId) || 1,
        company_id: 1,
        job_role_id: 1,
        title: "Software Developer",
        description: "Developing software applications using modern technologies.",
        requirements: "Experience with JavaScript, React, and Node.js. Strong problem-solving skills.",
        responsibilities: "Develop and maintain web applications, collaborate with team members.",
        location: "Remote",
        employment_type: "Full-time",
        salary_range: "Competitive",
        experience_required: "3+ years",
        skills_required: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
        qualifications: ["Bachelor's degree in Computer Science or related field"],
        benefits: ["Health insurance", "Remote work", "Flexible hours"],
        application_deadline: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Use our AI-enhanced analyzer even in fallback mode
      const analysis = await analyzeResume(resumeText, mockPosition)

      return NextResponse.json({
        success: true,
        application: {
          id: Date.now(),
          name: candidateData.name,
          email: candidateData.email,
          jobPositionId: jobPositionId,
          resumeScore: analysis.score,
          analysis,
          submittedAt: new Date().toISOString(),
          jobTitle: "Software Developer",
          threshold: 70,
        },
        note: "Using AI-powered analysis - database connection failed",
      })
    }
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return NextResponse.json({ error: "Failed to analyze resume", success: false }, { status: 500 })
  }
}
