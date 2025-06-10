import { getSQL, isDatabaseConnected } from "./database"

// Get job positions by role ID or all positions
export async function getJobPositionsByRole(roleId: string | null) {
  if (!isDatabaseConnected()) {
    console.log("Database not connected, using demo positions")
    return { success: true, positions: [] } // Return empty array instead of demo data
  }

  try {
    const sql = await getSQL()
    if (!sql) {
      console.log("SQL connection not available, returning empty positions")
      return { success: true, positions: [] }
    }

    // First check if the tables exist
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'job_positions'
        );
      `

      if (!tableCheck[0] || !tableCheck[0].exists) {
        console.log("job_positions table does not exist, returning empty array")
        return { success: true, positions: [] }
      }
    } catch (tableError) {
      console.error("Error checking table existence:", tableError)
      return { success: true, positions: [] }
    }

    let positions

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

    return { success: true, positions }
  } catch (error) {
    console.error("Error fetching job positions:", error)
    return { success: false, error: "Database error", positions: [] }
  }
}

// Get all job roles
export async function getJobRoles() {
  if (!isDatabaseConnected()) {
    console.log("Database not connected, returning empty roles")
    return { success: true, roles: [] }
  }

  try {
    const sql = await getSQL()
    if (!sql) {
      console.log("SQL connection not available, returning empty roles")
      return { success: true, roles: [] }
    }

    // Check if the table exists first
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
        return { success: true, roles: [] }
      }
    } catch (tableError) {
      console.error("Error checking table existence:", tableError)
      return { success: true, roles: [] }
    }

    const roles = await sql`
      SELECT id, role_name, category, required_skills, experience_level, keywords, resume_threshold
      FROM job_roles 
      WHERE is_active = true 
      ORDER BY category, role_name
    `
    return { success: true, roles }
  } catch (error) {
    console.error("Error fetching job roles:", error)
    return { success: false, error: "Database error", roles: [] }
  }
}
