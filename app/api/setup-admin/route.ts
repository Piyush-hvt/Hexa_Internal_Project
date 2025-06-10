import { NextResponse } from "next/server"
import { getSQL } from "@/lib/database"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = await getSQL()
    if (!sql) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    // Hash the admin password properly
    const hashedPassword = await hashPassword("admin123")

    // Update or insert the admin user with proper password hash
    await sql`
      INSERT INTO admin_users (username, password_hash, email, role) 
      VALUES ('admin', ${hashedPassword}, 'admin@hexaview.com', 'admin')
      ON CONFLICT (username) 
      DO UPDATE SET 
        password_hash = ${hashedPassword},
        updated_at = CURRENT_TIMESTAMP;
    `

    return NextResponse.json({
      success: true,
      message: "Admin user setup completed with proper password hash",
    })
  } catch (error) {
    console.error("Error setting up admin user:", error)
    return NextResponse.json(
      {
        error: "Failed to setup admin user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
