import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin } from "@/lib/auth"
import { initializeDatabase } from "@/lib/init-database"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Try to initialize database if it doesn't exist
    if (process.env.DATABASE_URL) {
      try {
        await initializeDatabase()
      } catch (initError) {
        console.error("Database initialization failed during login:", initError)
        // Continue with authentication anyway, it will fall back to demo mode
      }
    }

    const user = await authenticateAdmin(username, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
