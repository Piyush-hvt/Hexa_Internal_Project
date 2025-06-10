"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  FileText,
  Award,
  Mail,
  Plus,
  Search,
  Building,
  Briefcase,
  X,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface JobRole {
  id: number
  role_name: string
  category: string
  required_skills: string[]
}

interface JobPosition {
  id: number
  title: string
  description: string
  requirements: string
  responsibilities: string
  location: string
  employment_type: string
  salary_range: string
  experience_required: string
  company_name: string
  role_name: string
  job_role_id: number
  skills_required: string[]
  qualifications: string[]
  benefits: string[]
  created_at: string
  is_active: boolean
  category: string
}

interface Application {
  id: number
  candidate_name: string
  candidate_email: string
  job_position_id: number
  resume_score: number
  screening_score: number
  final_score: number
  status: string
  submitted_at: string
  job_title: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([])
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPosition, setIsCreatingPosition] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [positionToDelete, setPositionToDelete] = useState<number | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const [newPosition, setNewPosition] = useState({
    job_role_id: "",
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    employment_type: "Full-time",
    salary_range: "",
    experience_required: "",
    skills_required: [] as string[],
    qualifications: [] as string[],
    benefits: [] as string[],
    company_id: 1, // Default company ID
  })

  const [newSkill, setNewSkill] = useState("")
  const [newQualification, setNewQualification] = useState("")
  const [newBenefit, setNewBenefit] = useState("")

  // Add a new state for category filter
  const [filterCategory, setFilterCategory] = useState("all")

  // Modified state variables for streamlined role creation
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false)
  const [showCreatePositionDialog, setShowCreatePositionDialog] = useState(false)
  const [isCreatingRole, setIsCreatingRole] = useState(false)
  const [newRole, setNewRole] = useState({
    role_name: "",
    category: "",
    description: "",
    requirements: "",
  })

  useEffect(() => {
    checkAuth()
  }, [])

  // Add a new function to initialize the database
  const initializeDb = async () => {
    setError("") // Clear any previous errors
    try {
      const response = await fetch("/api/init-database")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log("Database initialization:", data.message)
        // After initialization, fetch the data with a small delay to ensure DB is ready
        setTimeout(async () => {
          await fetchJobRoles()
          await fetchJobPositions()
          await fetchApplications()
        }, 1000)
      } else {
        console.error("Database initialization failed:", data.error)
        setError(`Database initialization failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error initializing database:", error)
      setError(`Failed to initialize database: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Update the useEffect that runs after authentication
  useEffect(() => {
    if (isAuthenticated) {
      // First try to initialize the database
      initializeDb()
    }
  }, [isAuthenticated])

  useEffect(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job_title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((app) =>
        filterStatus === "qualified" ? app.status === "qualified" : app.status !== "qualified",
      )
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, filterStatus])

  const checkAuth = () => {
    const authData = localStorage.getItem("adminAuth")
    if (!authData) {
      router.push("/admin/login")
      return
    }

    try {
      const userData = JSON.parse(authData)
      if (!userData || !userData.username) {
        router.push("/admin/login")
        return
      }
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/admin/login")
    }
  }

  const fetchJobRoles = async () => {
    setError("") // Clear any previous errors
    try {
      const response = await fetch("/api/job-roles")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setJobRoles(data.roles || [])
        if (data.roles?.length === 0 && data.note) {
          console.log("API Note:", data.note)
          setError(`Note: ${data.note}. Try initializing the database first.`)
        }
      } else {
        console.error("API error:", data.error)
        setError(`Failed to load job roles: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error fetching job roles:", error)
      setError(`Failed to load job roles: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const fetchJobPositions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/job-positions")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      if (data.success) {
        setJobPositions(data.positions || [])
        if (data.note) {
          console.log("API Note:", data.note)
          setError(`Note from API: ${data.note}`)
        }
      } else {
        console.error("API error:", data.error)
        setJobPositions([])
        setError(data.error || "Failed to fetch job positions")
      }
    } catch (error) {
      console.error("Error fetching job positions:", error)
      setJobPositions([])
      setError("Failed to load job positions. The database tables may not be set up correctly.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications")
      if (!response.ok) {
        // If API not implemented yet, use empty array
        setApplications([])
        setFilteredApplications([])
        return
      }

      const data = await response.json()
      if (data.success) {
        setApplications(data.applications || [])
        setFilteredApplications(data.applications || [])
      } else {
        setApplications([])
        setFilteredApplications([])
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      setApplications([])
      setFilteredApplications([])
    }
  }

  // Modified function to handle the streamlined flow
  const handleStartCreatePosition = () => {
    // Reset all forms
    setNewRole({
      role_name: "",
      category: "",
      description: "",
      requirements: "",
    })
    setNewPosition({
      job_role_id: "",
      title: "",
      description: "",
      requirements: "",
      responsibilities: "",
      location: "",
      employment_type: "Full-time",
      salary_range: "",
      experience_required: "",
      skills_required: [],
      qualifications: [],
      benefits: [],
      company_id: 1,
    })
    setNewSkill("")
    setNewQualification("")
    setNewBenefit("")
    setError("")

    // Open role creation dialog first
    setShowCreateRoleDialog(true)
  }

  const handleCreatePosition = async () => {
    // Clear any previous errors
    setError("")

    // Validate required fields
    if (!newPosition.job_role_id) {
      setError("Please select a job role")
      return
    }

    if (!newPosition.title.trim()) {
      setError("Please enter a job title")
      return
    }

    if (!newPosition.description.trim()) {
      setError("Please enter a job description")
      return
    }

    setIsCreatingPosition(true)

    try {
      const response = await fetch("/api/job-positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPosition,
          job_role_id: Number.parseInt(newPosition.job_role_id), // Ensure it's a number
          title: newPosition.title.trim(),
          description: newPosition.description.trim(),
          requirements: newPosition.requirements.trim(),
          responsibilities: newPosition.responsibilities.trim(),
          location: newPosition.location.trim(),
          salary_range: newPosition.salary_range.trim(),
          experience_required: newPosition.experience_required.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        // Reset form and close dialog
        setNewPosition({
          job_role_id: "",
          title: "",
          description: "",
          requirements: "",
          responsibilities: "",
          location: "",
          employment_type: "Full-time",
          salary_range: "",
          experience_required: "",
          skills_required: [],
          qualifications: [],
          benefits: [],
          company_id: 1,
        })

        // Clear form state
        setNewSkill("")
        setNewQualification("")
        setNewBenefit("")
        setShowCreatePositionDialog(false)

        // Refresh the positions list
        await fetchJobPositions()

        // Show success message (optional)
        console.log("Position created successfully!")
      } else {
        setError(data.error || "Failed to create position")
      }
    } catch (error) {
      console.error("Error creating position:", error)
      setError(error instanceof Error ? error.message : "Failed to create position. Please try again.")
    } finally {
      setIsCreatingPosition(false)
    }
  }

  const handleDeletePosition = async (id: number) => {
    try {
      const response = await fetch(`/api/job-positions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete position")

      const data = await response.json()
      if (data.success) {
        fetchJobPositions()
      } else {
        setError(data.error || "Failed to delete position")
      }
    } catch (error) {
      console.error("Error deleting position:", error)
      setError("Failed to delete position. Please try again.")
    } finally {
      setShowDeleteConfirm(false)
      setPositionToDelete(null)
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !newPosition.skills_required.includes(newSkill.trim())) {
      setNewPosition({
        ...newPosition,
        skills_required: [...newPosition.skills_required, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setNewPosition({
      ...newPosition,
      skills_required: newPosition.skills_required.filter((s) => s !== skill),
    })
  }

  const handleAddQualification = () => {
    if (newQualification.trim() && !newPosition.qualifications.includes(newQualification.trim())) {
      setNewPosition({
        ...newPosition,
        qualifications: [...newPosition.qualifications, newQualification.trim()],
      })
      setNewQualification("")
    }
  }

  const handleRemoveQualification = (qualification: string) => {
    setNewPosition({
      ...newPosition,
      qualifications: newPosition.qualifications.filter((q) => q !== qualification),
    })
  }

  const handleAddBenefit = () => {
    if (newBenefit.trim() && !newPosition.benefits.includes(newBenefit.trim())) {
      setNewPosition({
        ...newPosition,
        benefits: [...newPosition.benefits, newBenefit.trim()],
      })
      setNewBenefit("")
    }
  }

  const handleRemoveBenefit = (benefit: string) => {
    setNewPosition({
      ...newPosition,
      benefits: newPosition.benefits.filter((b) => b !== benefit),
    })
  }

  // Modified function for streamlined role creation
  const handleCreateRole = async () => {
    setError("")

    // Validate required fields
    if (!newRole.role_name.trim()) {
      setError("Please enter a role name")
      return
    }

    if (!newRole.category.trim()) {
      setError("Please select a category")
      return
    }

    if (!newRole.description.trim()) {
      setError("Please enter a job description")
      return
    }

    if (!newRole.requirements.trim()) {
      setError("Please enter job requirements")
      return
    }

    setIsCreatingRole(true)

    try {
      const response = await fetch("/api/job-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role_name: newRole.role_name.trim(),
          category: newRole.category.trim(),
          required_skills: [], // Empty for now, will be filled in position creation
          experience_level: "Mid-level", // Default value
          keywords: [], // Empty for now
          resume_threshold: 70, // Default value
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        // Refresh job roles
        await fetchJobRoles()

        // Pre-fill position form with role data
        setNewPosition({
          ...newPosition,
          job_role_id: data.role.id.toString(),
          title: newRole.role_name,
          description: newRole.description,
          requirements: newRole.requirements,
        })

        // Close role dialog and open position dialog
        setShowCreateRoleDialog(false)
        setShowCreatePositionDialog(true)

        console.log("Job role created successfully!")
      } else {
        setError(data.error || "Failed to create job role")
      }
    } catch (error) {
      console.error("Error creating job role:", error)
      setError(error instanceof Error ? error.message : "Failed to create job role. Please try again.")
    } finally {
      setIsCreatingRole(false)
    }
  }

  const handleSendToHR = (application: Application) => {
    alert(`Sending ${application.candidate_name}'s application to HR team`)
    // In a real app, this would trigger an email to HR
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin/login")
  }

  const stats = {
    totalPositions: jobPositions.length,
    totalApplications: applications.length,
    qualifiedCandidates: applications.filter((app) => app.status === "qualified").length,
    pendingReview: applications.filter((app) => app.status === "qualified").length,
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "developer":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "qa":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "hr":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "it":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "salesforce":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
      case "data & analytics":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
      case "design":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200"
      case "management":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hexaview Admin Dashboard</h1>
            <p className="text-gray-600">Manage job positions, applications, and settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={initializeDb}>
              Initialize Database
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Positions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPositions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.qualifiedCandidates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="positions">Job Positions</TabsTrigger>
            <TabsTrigger value="roles">Job Roles</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Job Position Management</CardTitle>
                <CardDescription>Create and manage job positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <Button onClick={handleStartCreatePosition}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Position
                    </Button>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="categoryFilter" className="text-sm">
                        Filter by:
                      </Label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger id="categoryFilter" className="w-[180px]">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Developer">Developer</SelectItem>
                          <SelectItem value="QA">QA</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Salesforce">Salesforce</SelectItem>
                          <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading job positions...</p>
                    </div>
                  ) : jobPositions.filter(
                      (position) => filterCategory === "all" || position.category === filterCategory,
                    ).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Positions</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {filterCategory === "all"
                          ? "You haven't created any job positions yet. Click the button above to create your first position."
                          : `No positions found in the ${filterCategory} category. Try selecting a different category or create a new position.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobPositions
                        .filter((position) => filterCategory === "all" || position.category === filterCategory)
                        .map((position) => (
                          <Card key={position.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="flex-1 p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold">{position.title}</h3>
                                    <p className="text-sm text-gray-600 flex items-center">
                                      <Building className="h-3 w-3 mr-1" />
                                      {position.company_name} • {position.role_name}
                                      <Badge
                                        variant="outline"
                                        className={`ml-2 ${getCategoryColor(position.category)}`}
                                      >
                                        {position.category}
                                      </Badge>
                                    </p>
                                  </div>
                                  <Badge variant={position.is_active ? "default" : "secondary"}>
                                    {position.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Location</p>
                                    <p className="font-medium">{position.location || "Not specified"}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Type</p>
                                    <p className="font-medium">{position.employment_type}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Salary</p>
                                    <p className="font-medium">{position.salary_range || "Not specified"}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Experience</p>
                                    <p className="font-medium">{position.experience_required || "Not specified"}</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <p className="text-sm text-gray-700 line-clamp-2">{position.description}</p>
                                </div>

                                {position.skills_required && position.skills_required.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {position.skills_required.slice(0, 5).map((skill, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {position.skills_required.length > 5 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{position.skills_required.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                <div className="text-xs text-gray-500">
                                  Created: {new Date(position.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="flex md:flex-col justify-end p-4 md:p-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200">
                                <Button variant="outline" size="sm" className="mr-2 md:mr-0 md:mb-2">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setPositionToDelete(position.id)
                                    setShowDeleteConfirm(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Job Role Management</CardTitle>
                <CardDescription>Create and manage job roles that can be used for positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Button onClick={() => setShowCreateRoleDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Job Role
                    </Button>
                    <div className="text-sm text-gray-600">Total Roles: {jobRoles.length}</div>
                  </div>

                  {jobRoles.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Roles</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        You haven't created any job roles yet. Job roles are templates that define the skills and
                        requirements for different positions.
                      </p>
                      <Button onClick={() => setShowCreateRoleDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Job Role
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobRoles.map((role) => (
                        <Card key={role.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">{role.role_name}</h3>
                                <Badge variant="outline" className={`mt-1 ${getCategoryColor(role.category)}`}>
                                  {role.category}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-gray-500">Experience Level</p>
                                <p className="font-medium">{role.experience_level || "Not specified"}</p>
                              </div>

                              <div>
                                <p className="text-gray-500">Resume Threshold</p>
                                <p className="font-medium">{role.resume_threshold || 70}%</p>
                              </div>

                              {role.required_skills && role.required_skills.length > 0 && (
                                <div>
                                  <p className="text-gray-500 mb-1">Required Skills</p>
                                  <div className="flex flex-wrap gap-1">
                                    {role.required_skills.slice(0, 3).map((skill, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {role.required_skills.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{role.required_skills.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {role.keywords && role.keywords.length > 0 && (
                                <div>
                                  <p className="text-gray-500 mb-1">Keywords</p>
                                  <div className="flex flex-wrap gap-1">
                                    {role.keywords.slice(0, 3).map((keyword, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {keyword}
                                      </Badge>
                                    ))}
                                    {role.keywords.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{role.keywords.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Application Management</CardTitle>
                <CardDescription>Review and manage candidate applications</CardDescription>

                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Applications</SelectItem>
                      <SelectItem value="qualified">Qualified Only</SelectItem>
                      <SelectItem value="not-qualified">Not Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      There are no applications matching your criteria. Try changing your search or filter settings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{application.candidate_name}</h3>
                              <Badge variant={application.status === "qualified" ? "default" : "secondary"}>
                                {application.status === "qualified" ? "Qualified" : "Not Qualified"}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Email: {application.candidate_email}</p>
                              <p>Role: {application.job_title}</p>
                              <p>Applied: {new Date(application.submitted_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="text-center mx-8">
                            <div className="text-2xl font-bold text-gray-900">{application.final_score || "-"}</div>
                            <div className="text-sm text-gray-500">Final Score</div>
                            <div className="flex gap-2 mt-2 text-xs">
                              <span>Resume: {application.resume_score}</span>
                              <span>Test: {application.screening_score || "-"}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {application.status === "qualified" && (
                              <Button size="sm" onClick={() => handleSendToHR(application)}>
                                Send to HR
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure thresholds and system parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="resumeThreshold">Resume Score Threshold</Label>
                    <Input id="resumeThreshold" type="number" defaultValue={70} />
                    <p className="text-sm text-gray-500">Minimum score to qualify for screening test</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="finalThreshold">Final Score Threshold</Label>
                    <Input id="finalThreshold" type="number" defaultValue={140} />
                    <p className="text-sm text-gray-500">Minimum combined score to send to HR</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testDuration">Test Duration (minutes)</Label>
                    <Input id="testDuration" type="number" defaultValue={25} />
                    <p className="text-sm text-gray-500">Time limit for screening test</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hrEmail">HR Email</Label>
                    <Input id="hrEmail" type="email" defaultValue="hr@hexaview.com" />
                    <p className="text-sm text-gray-500">Email address for HR notifications</p>
                  </div>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Streamlined Create Job Role Dialog */}
      <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Job Role</DialogTitle>
            <DialogDescription>
              First, let's create the job role. This will define the basic information for your position.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role_name">Role Name *</Label>
                <Input
                  id="role_name"
                  value={newRole.role_name}
                  onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                  placeholder="e.g. Senior QA Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={newRole.category} onValueChange={(value) => setNewRole({ ...newRole, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Developer">Developer</SelectItem>
                    <SelectItem value="QA">QA</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Salesforce">Salesforce</SelectItem>
                    <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Provide a detailed description of the job role"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                value={newRole.requirements}
                onChange={(e) => setNewRole({ ...newRole, requirements: e.target.value })}
                placeholder="List the requirements for this role"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={isCreatingRole}>
              {isCreatingRole ? "Creating..." : "Create Role & Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Position Dialog */}
      <Dialog open={showCreatePositionDialog} onOpenChange={setShowCreatePositionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Job Position</DialogTitle>
            <DialogDescription>Now let's add the additional details for your job position.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={newPosition.title}
                onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newPosition.location}
                onChange={(e) => setNewPosition({ ...newPosition, location: e.target.value })}
                placeholder="e.g. San Francisco, CA or Remote"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select
                value={newPosition.employment_type}
                onChange={(e) => setNewPosition({ ...newPosition, employment_type: e.target.value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={newPosition.salary_range}
                onChange={(e) => setNewPosition({ ...newPosition, salary_range: e.target.value })}
                placeholder="e.g. $80,000 - $120,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_required">Experience Required</Label>
              <Input
                id="experience_required"
                value={newPosition.experience_required}
                onChange={(e) => setNewPosition({ ...newPosition, experience_required: e.target.value })}
                placeholder="e.g. 3-5 years"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea
                id="responsibilities"
                value={newPosition.responsibilities}
                onChange={(e) => setNewPosition({ ...newPosition, responsibilities: e.target.value })}
                placeholder="List the key responsibilities for this position"
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSkill} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newPosition.skills_required.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {skill}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemoveSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Qualifications</Label>
              <div className="flex gap-2">
                <Input
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder="Add a qualification"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddQualification()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddQualification} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newPosition.qualifications.map((qualification, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {qualification}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveQualification(qualification)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Benefits</Label>
              <div className="flex gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddBenefit()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddBenefit} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newPosition.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {benefit}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemoveBenefit(benefit)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePositionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePosition} disabled={isCreatingPosition}>
              {isCreatingPosition ? "Creating..." : "Create Position"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job position? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => positionToDelete && handleDeletePosition(positionToDelete)}>
              Delete Position
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
