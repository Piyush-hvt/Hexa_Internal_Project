import { type NextRequest, NextResponse } from "next/server"
import { getSQL } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        applications: [],
        note: "Database not configured, returning empty applications",
      })
    }

    const sql = await getSQL()
    if (!sql) {
      return NextResponse.json({
        success: true,
        applications: [],
        note: "Database connection not available, returning empty applications",
      })
    }

    // First check if the tables exist
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'applications'
        );
      `

      if (!tableCheck[0].exists) {
        console.log("applications table does not exist, returning empty array")
        return NextResponse.json({
          success: true,
          applications: [],
          note: "applications table does not exist, returning empty applications",
        })
      }
    } catch (tableError) {
      console.error("Error checking table existence:", tableError)
      return NextResponse.json({
        success: true,
        applications: [],
        note: "Error checking table existence, returning empty applications",
      })
    }

    // If we get here, the table exists, so proceed with the query
    try {
      const applications = await sql`
        SELECT 
          a.id, 
          a.candidate_name, 
          a.candidate_email, 
          a.job_position_id,
          a.resume_score, 
          a.screening_score, 
          a.final_score,
          a.status, 
          a.submitted_at,
          jp.title as job_title
        FROM applications a
        JOIN job_positions jp ON a.job_position_id = jp.id
        ORDER BY a.submitted_at DESC
      `

      return NextResponse.json({ success: true, applications })
    } catch (queryError) {
      console.error("Error querying applications:", queryError)
      return NextResponse.json({
        success: true,
        applications: [],
        note: "Error querying applications, returning empty applications",
      })
    }
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({
      success: true,
      applications: [],
      note: "Error fetching applications, returning empty list",
    })
  }
}
