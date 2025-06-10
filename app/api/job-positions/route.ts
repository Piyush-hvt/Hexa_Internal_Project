import { type NextRequest, NextResponse } from "next/server"
import { getSQL } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get("roleId")

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        positions: [],
        note: "Database not configured, returning empty positions",
      })
    }

    const sql = await getSQL()
    if (!sql) {
      return NextResponse.json({
        success: true,
        positions: [],
        note: "Database connection not available, returning empty positions",
      })
    }

    // First check if the table exists
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'job_positions'
        );
      `

      if (!tableCheck[0].exists) {
        console.log("job_positions table does not exist, returning empty array")
        return NextResponse.json({
          success: true,
          positions: [],
          note: "job_positions table does not exist, returning empty positions",
        })
      }
    } catch (tableError) {
      console.error("Error checking table existence:", tableError)
      return NextResponse.json({
        success: true,
        positions: [],
        note: "Error checking table existence, returning empty positions",
      })
    }

    // If we get here, the table exists, so proceed with the query
    let positions
    try {
      if (roleId) {
        positions = await sql`
          SELECT 
            jp.*,
            jr.role_name,
            jr.category,
            c.name as company_name
          FROM job_positions jp
          JOIN job_roles jr ON jp.job_role_id = jr.id
          JOIN companies c ON jp.company_id = c.id
          WHERE jp.is_active = true AND jp.job_role_id = ${roleId}
          ORDER BY jp.created_at DESC
        `
      } else {
        positions = await sql`
          SELECT 
            jp.*,
            jr.role_name,
            jr.category,
            c.name as company_name
          FROM job_positions jp
          JOIN job_roles jr ON jp.job_role_id = jr.id
          JOIN companies c ON jp.company_id = c.id
          WHERE jp.is_active = true
          ORDER BY jp.created_at DESC
        `
      }

      return NextResponse.json({ success: true, positions })
    } catch (queryError) {
      console.error("Error querying job positions:", queryError)
      return NextResponse.json({
        success: true,
        positions: [],
        note: "Error querying job positions, returning empty positions",
      })
    }
  } catch (error) {
    console.error("Error fetching job positions:", error)
    return NextResponse.json({
      success: true,
      positions: [],
      note: "Error fetching positions, returning empty list",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 500 },
      )
    }

    const sql = await getSQL()
    if (!sql) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection not available",
        },
        { status: 500 },
      )
    }

    // Validate required fields
    if (!data.job_role_id || !data.title || !data.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: job_role_id, title, or description",
        },
        { status: 400 },
      )
    }

    // Ensure arrays are properly formatted
    const skillsRequired = Array.isArray(data.skills_required) ? data.skills_required : []
    const qualifications = Array.isArray(data.qualifications) ? data.qualifications : []
    const benefits = Array.isArray(data.benefits) ? data.benefits : []

    try {
      const result = await sql`
        INSERT INTO job_positions (
          company_id, 
          job_role_id, 
          title, 
          description, 
          requirements,
          responsibilities, 
          location, 
          employment_type, 
          salary_range,
          experience_required, 
          skills_required, 
          qualifications, 
          benefits,
          is_active
        ) VALUES (
          ${data.company_id || 1}, 
          ${Number.parseInt(data.job_role_id)}, 
          ${data.title}, 
          ${data.description}, 
          ${data.requirements || ""}, 
          ${data.responsibilities || ""}, 
          ${data.location || ""}, 
          ${data.employment_type || "Full-time"}, 
          ${data.salary_range || ""}, 
          ${data.experience_required || ""}, 
          ${skillsRequired}, 
          ${qualifications}, 
          ${benefits},
          true
        ) RETURNING *
      `

      return NextResponse.json({ success: true, position: result[0] })
    } catch (insertError) {
      console.error("Error inserting job position:", insertError)
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to create job position: " + (insertError instanceof Error ? insertError.message : "Unknown error"),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error creating job position:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create job position: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}
