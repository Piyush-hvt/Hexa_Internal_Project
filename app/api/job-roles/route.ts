import { NextResponse } from "next/server"
import { getSQL, isDatabaseConnected } from "@/lib/database"

export async function GET() {
  try {
    // First check if database is connected
    if (!isDatabaseConnected()) {
      console.log("Database not connected, returning empty roles")
      return NextResponse.json({
        success: true,
        roles: [],
        note: "Database not connected, returning empty roles",
      })
    }

    const sql = await getSQL()
    if (!sql) {
      console.log("SQL connection not available, returning empty roles")
      return NextResponse.json({
        success: true,
        roles: [],
        note: "Database connection not available, returning empty roles",
      })
    }

    // First check if the table exists
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'job_roles'
        );
      `

      if (!tableCheck[0] || !tableCheck[0].exists) {
        console.log("job_roles table does not exist, returning empty array")
        return NextResponse.json({
          success: true,
          roles: [],
          note: "job_roles table does not exist, returning empty roles",
        })
      }
    } catch (tableError) {
      console.error("Error checking table existence:", tableError)
      return NextResponse.json({
        success: true,
        roles: [],
        note: "Error checking table existence, returning empty roles",
      })
    }

    // If we get here, the table exists, so proceed with the query
    try {
      const roles = await sql`
        SELECT id, role_name, category, required_skills, experience_level, keywords, resume_threshold
        FROM job_roles 
        WHERE is_active = true 
        ORDER BY category, role_name
      `
      return NextResponse.json({ success: true, roles })
    } catch (queryError) {
      console.error("Error querying job roles:", queryError)
      return NextResponse.json({
        success: true,
        roles: [],
        note: "Error querying job roles, returning empty roles",
      })
    }
  } catch (error) {
    console.error("Error in job-roles API:", error)
    return NextResponse.json({
      success: true,
      roles: [],
      note: "Error fetching roles, returning empty list",
    })
  }
}

export async function POST(request: Request) {
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
    if (!data.role_name || !data.category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: role_name or category",
        },
        { status: 400 },
      )
    }

    // Check if role already exists
    try {
      const existingRole = await sql`
        SELECT id FROM job_roles 
        WHERE LOWER(role_name) = LOWER(${data.role_name}) 
        AND LOWER(category) = LOWER(${data.category})
      `

      if (existingRole.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "A job role with this name already exists in this category",
          },
          { status: 400 },
        )
      }
    } catch (checkError) {
      console.error("Error checking existing role:", checkError)
      return NextResponse.json(
        {
          success: false,
          error: "Error checking existing roles",
        },
        { status: 500 },
      )
    }

    // Ensure arrays are properly formatted
    const requiredSkills = Array.isArray(data.required_skills) ? data.required_skills : []
    const keywords = Array.isArray(data.keywords) ? data.keywords : []

    try {
      const result = await sql`
        INSERT INTO job_roles (
          role_name, 
          category, 
          required_skills, 
          experience_level, 
          keywords, 
          resume_threshold,
          is_active
        ) VALUES (
          ${data.role_name.trim()}, 
          ${data.category.trim()}, 
          ${requiredSkills}, 
          ${data.experience_level || "Mid-level"}, 
          ${keywords}, 
          ${data.resume_threshold || 70},
          true
        ) RETURNING *
      `

      return NextResponse.json({ success: true, role: result[0] })
    } catch (insertError) {
      console.error("Error inserting job role:", insertError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create job role: " + (insertError instanceof Error ? insertError.message : "Unknown error"),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error creating job role:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create job role: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}
