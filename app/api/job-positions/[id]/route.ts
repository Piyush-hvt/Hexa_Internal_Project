import { type NextRequest, NextResponse } from "next/server"
import { getSQL } from "@/lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

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

    // Instead of actually deleting, we set is_active to false
    const result = await sql`
      UPDATE job_positions
      SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Position not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job position:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete job position",
      },
      { status: 500 },
    )
  }
}
