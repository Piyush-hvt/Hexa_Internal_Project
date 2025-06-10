"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Building,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  category: string
  skills_required: string[]
  qualifications: string[]
  benefits: string[]
}

export default function CandidatePage() {
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([])
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null as File | null,
  })
  const router = useRouter()

  useEffect(() => {
    fetchAllJobPositions()
  }, [])

  const fetchAllJobPositions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/job-positions")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setJobPositions(data.positions || [])
      } else {
        console.error("API error:", data.error)
        setJobPositions([])
      }
    } catch (error) {
      console.error("Error fetching job positions:", error)
      setJobPositions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyClick = (position: JobPosition) => {
    setSelectedPosition(position)
    setShowApplicationForm(true)
    setError(null)
    setSuccess(null)
    setResumeText(null)
  }

  const handleBackToPositions = () => {
    setShowApplicationForm(false)
    setSelectedPosition(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      resume: null,
    })
    setError(null)
    setSuccess(null)
    setResumeText(null)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)
    setSuccess(null)
    setResumeText(null)

    if (!file) {
      return
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    const allowedExtensions = [".pdf", ".docx", ".txt"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError("Please upload a PDF, DOCX, or TXT file")
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setFormData((prev) => ({ ...prev, resume: file }))
    setIsExtracting(true)

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      console.log("Uploading file for text extraction:", file.name)

      // Call our text extraction API
      const response = await fetch("/api/extract-resume-text", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to extract text from file")
      }

      const result = await response.json()

      if (result.success && result.text) {
        setResumeText(result.text)
        setSuccess(`Successfully extracted ${result.length} characters from your resume`)
        console.log("Text extraction successful, length:", result.length)
      } else {
        throw new Error("No text could be extracted from the file")
      }
    } catch (err) {
      console.error("Error extracting text from file:", err)
      setError(err instanceof Error ? err.message : "Could not read resume content. Please try a different file.")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.resume || !selectedPosition) {
      setError("Please fill all required fields and upload a resume")
      return
    }

    if (!resumeText || resumeText.trim().length < 50) {
      setError("Could not extract sufficient text from resume. Please try a different file or format.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      console.log("Submitting application with resume text length:", resumeText.length)

      const analysisResponse = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText,
          jobPositionId: selectedPosition.id,
          candidateData: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error(`HTTP error! status: ${analysisResponse.status}`)
      }

      const analysisData = await analysisResponse.json()

      if (analysisData.success) {
        localStorage.setItem("candidateData", JSON.stringify(analysisData.application))
        router.push("/candidate/results")
      } else {
        setError(analysisData.error || "Analysis failed. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      setError("Submission failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const getCategoryVariant = (category: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (category?.toLowerCase()) {
      case "developer":
        return "default"
      case "qa":
        return "secondary"
      case "hr":
        return "outline"
      case "it":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading available positions...</p>
        </div>
      </div>
    )
  }

  if (showApplicationForm && selectedPosition) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToPositions} className="mb-4">
              ← Back to Positions
            </Button>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for {selectedPosition.title}</h1>
              <p className="text-gray-600">{selectedPosition.company_name}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Application Form</CardTitle>
                  <CardDescription>Fill in your details and upload your resume for AI-powered analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success</AlertTitle>
                      <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resume">Resume Upload *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          id="resume"
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isExtracting}
                        />
                        <label htmlFor="resume" className="cursor-pointer">
                          {isExtracting ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                              <div className="text-center">
                                <span className="text-sm font-medium block">Extracting text from resume...</span>
                                <span className="text-xs text-gray-500">This may take a few seconds</span>
                              </div>
                            </div>
                          ) : formData.resume ? (
                            <div className="flex items-center justify-center space-x-2">
                              <FileText className={`h-8 w-8 ${resumeText ? "text-green-600" : "text-blue-600"}`} />
                              <div className="text-center">
                                <span className="text-sm font-medium block">{formData.resume.name}</span>
                                {resumeText && (
                                  <span className="text-xs text-green-600">✓ Text extracted successfully</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                              <div className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>{" "}
                                or drag and drop
                              </div>
                              <p className="text-xs text-gray-500">PDF, DOCX, or TXT (max 10MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {resumeText && (
                      <div className="space-y-2">
                        <Label>Resume Content Preview</Label>
                        <div className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto">
                          <pre className="text-xs whitespace-pre-wrap font-mono">
                            {resumeText.slice(0, 800)}
                            {resumeText.length > 800 ? "\n\n... (content truncated for preview)" : ""}
                          </pre>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Successfully extracted {resumeText.length} characters</span>
                          <span>Ready for AI analysis</span>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isUploading || !resumeText || isExtracting}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing Resume with AI...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedPosition.title}</CardTitle>
                  <CardDescription>{selectedPosition.company_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedPosition.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {selectedPosition.employment_type}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {selectedPosition.salary_range}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {selectedPosition.experience_required}
                  </div>
                  <div className="pt-2">
                    <h4 className="font-semibold mb-2">Required Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPosition.skills_required?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Smart Text Extraction</p>
                      <p className="text-xs text-gray-600">Advanced parsing of PDF, DOCX, and text files</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">AI Resume Analysis</p>
                      <p className="text-xs text-gray-600">
                        Perplexity AI analyzes your resume against job requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 rounded-full p-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Detailed Insights</p>
                      <p className="text-xs text-gray-600">Comprehensive feedback and improvement suggestions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Open Positions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exciting career opportunities at Hexaview. Apply to positions that match your skills and
            experience.
          </p>
        </div>

        {jobPositions.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Open Positions</h3>
            <p className="text-gray-600 mb-6">
              We don't have any open positions at the moment. Please check back later or contact us directly.
            </p>
            <Button variant="outline">Contact HR</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPositions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{position.title}</CardTitle>
                      <CardDescription className="flex items-center mb-2">
                        <Building className="h-4 w-4 mr-1" />
                        {position.company_name}
                      </CardDescription>
                    </div>
                    <Badge variant={getCategoryVariant(position.category)} className="ml-2">
                      {position.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 line-clamp-3">{position.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{position.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{position.employment_type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{position.salary_range}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{position.experience_required}</span>
                    </div>
                  </div>

                  {position.skills_required && position.skills_required.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {position.skills_required.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {position.skills_required.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{position.skills_required.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button onClick={() => handleApplyClick(position)} className="w-full">
                    Apply for this Position
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
