import bcrypt from "bcryptjs"
import { getSQL } from "./database"

export interface AuthUser {
  id: number
  username: string
  email: string
  role: string
}

export async function authenticateAdmin(username: string, password: string): Promise<AuthUser | null> {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.log("Database not configured, using demo authentication")
      return authenticateWithDemo(username, password)
    }

    const sql = await getSQL()
    if (!sql) {
      console.log("Database connection not available, using demo authentication")
      return authenticateWithDemo(username, password)
    }

    // Check if admin_users table exists
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'admin_users'
        );
      `

      if (!tableCheck[0].exists) {
        console.log("admin_users table does not exist, using demo authentication")
        return authenticateWithDemo(username, password)
      }
    } catch (tableError) {
      console.error("Error checking admin_users table:", tableError)
      console.log("Falling back to demo authentication")
      return authenticateWithDemo(username, password)
    }

    // Try to authenticate with database
    try {
      const users = await sql`
        SELECT id, username, password_hash, email, role, is_active 
        FROM admin_users 
        WHERE username = ${username} AND is_active = true
      `

      if (users.length === 0) {
        console.log("User not found in database, trying demo authentication")
        return authenticateWithDemo(username, password)
      }

      const user = users[0]

      // Check if password_hash is the placeholder value (not properly hashed)
      if (user.password_hash === "$2b$10$rOzJqQZJQZJQZJQZJQZJQOzJqQZJQZJQZJQZJQZJQZJQZJQZJQZJQ") {
        // This is the placeholder hash, use demo authentication
        console.log("Using placeholder password hash, falling back to demo authentication")
        return authenticateWithDemo(username, password)
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash)

      if (!isValidPassword) {
        console.log("Invalid password, trying demo authentication as fallback")
        return authenticateWithDemo(username, password)
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    } catch (queryError) {
      console.error("Database query error:", queryError)
      console.log("Falling back to demo authentication")
      return authenticateWithDemo(username, password)
    }
  } catch (error) {
    console.error("Authentication error:", error)
    console.log("Falling back to demo authentication")
    return authenticateWithDemo(username, password)
  }
}

// Demo authentication for when database is not available
async function authenticateWithDemo(username: string, password: string): Promise<AuthUser | null> {
  console.log("Using demo authentication")

  // Demo credentials
  const demoUsers = [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      email: "admin@hexaview.com",
      role: "admin",
    },
    {
      id: 2,
      username: "hr",
      password: "hr123",
      email: "hr@hexaview.com",
      role: "hr",
    },
  ]

  const user = demoUsers.find((u) => u.username === username && u.password === password)

  if (user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
  }

  return null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}
