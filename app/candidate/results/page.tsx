"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, ChevronRight, Download, FileText, ArrowLeft } from "lucide-react"

interface ApplicationData {
  id: number
  name: string
  email: string
  jobPositionId: number
  resumeScore: number
  analysis: {
    score: number
    skillsMatch: number
    experienceMatch: number
    keywordMatch: number
    educationMatch: number
    strengths: string[]
    improvements: string[]
    details: {
      foundSkills: string[]
      missingSkills: string[]
      experienceYears: number
      relevantExperience: boolean
      educationMatch: boolean
      certifications: string[]
      matchedKeywords: string[]
      missedKeywords: string[]
      experienceLevel: string
      industryMatch: boolean
      aiInsights?: string[]
    }
  }
  submittedAt: string
  jobTitle: string
  threshold: number
}

export default function ResultsPage() {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("candidateData")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setApplicationData(parsedData)
      } catch (error) {
        console.error("Error parsing stored data:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleBackToJobs = () => {
    router.push("/candidate")
  }

  const handleContinueToScreening = () => {
    router.push("/candidate/screening")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!applicationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>We couldn't find your application results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Please submit your application first or try refreshing the page if you've already applied.
            </p>
            <Button onClick={handleBackToJobs} className="w-full">
              Back to Job Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { analysis, resumeScore, threshold, jobTitle } = applicationData
  const qualified = resumeScore >= threshold

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="outline" onClick={handleBackToJobs} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Listings
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Application Results</h1>
          <p className="text-xl text-gray-600">
            For <span className="font-semibold">{jobTitle}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resume Score</CardTitle>
                <CardDescription>How your resume matches the job requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <div
                    className={`text-5xl font-bold mb-2 ${
                      qualified ? "text-green-600" : resumeScore > threshold * 0.7 ? "text-amber-500" : "text-red-500"
                    }`}
                  >
                    {resumeScore}%
                  </div>
                  <Progress
                    value={resumeScore}
                    className="h-3 w-full mb-2"
                    indicatorClassName={
                      qualified ? "bg-green-600" : resumeScore > threshold * 0.7 ? "bg-amber-500" : "bg-red-500"
                    }
                  />
                  <div className="flex items-center justify-between w-full text-sm text-gray-500">
                    <span>0%</span>
                    <span className="text-xs">Threshold: {threshold}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Skills Match</span>
                    <span className="text-sm font-semibold">{analysis.skillsMatch}%</span>
                  </div>
                  <Progress value={analysis.skillsMatch} className="h-2 mb-3" />

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Experience Match</span>
                    <span className="text-sm font-semibold">{analysis.experienceMatch}%</span>
                  </div>
                  <Progress value={analysis.experienceMatch} className="h-2 mb-3" />

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Keyword Match</span>
                    <span className="text-sm font-semibold">{analysis.keywordMatch}%</span>
                  </div>
                  <Progress value={analysis.keywordMatch} className="h-2 mb-3" />

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Education Match</span>
                    <span className="text-sm font-semibold">{analysis.educationMatch}%</span>
                  </div>
                  <Progress value={analysis.educationMatch} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center p-3 rounded-lg mb-4 ${qualified ? "bg-green-50" : "bg-amber-50"}`}>
                  {qualified ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  )}
                  <div>
                    <p className={`font-medium ${qualified ? "text-green-700" : "text-amber-700"}`}>
                      {qualified ? "Qualified for Next Round" : "Resume Score Below Threshold"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {qualified
                        ? "You've been selected for the screening test!"
                        : "We recommend improving your resume based on our suggestions."}
                    </p>
                  </div>
                </div>

                {qualified ? (
                  <Button onClick={handleContinueToScreening} className="w-full">
                    Continue to Screening Test
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button variant="outline" onClick={handleBackToJobs} className="w-full">
                      Browse Other Positions
                    </Button>
                    <Button variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Detailed Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Analysis</CardTitle>
                <CardDescription>Detailed breakdown of your resume match</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Skills Assessment</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Found Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.details.foundSkills.length > 0 ? (
                          analysis.details.foundSkills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No matching skills found</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Missing Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.details.missingSkills.length > 0 ? (
                          analysis.details.missingSkills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">All required skills found!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Experience</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Detected Experience</span>
                        <span className="text-sm font-medium">{analysis.details.experienceYears} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Experience Level</span>
                        <span className="text-sm font-medium">{analysis.details.experienceLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Relevant to Position</span>
                        <span className="text-sm font-medium">
                          {analysis.details.relevantExperience ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Yes
                            </span>
                          ) : (
                            <span className="text-amber-500 flex items-center">
                              <AlertCircle className="h-3.5 w-3.5 mr-1" />
                              Partially
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Education & Certifications</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Relevant Education</span>
                        <span className="text-sm font-medium">
                          {analysis.details.educationMatch ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Yes
                            </span>
                          ) : (
                            <span className="text-amber-500 flex items-center">
                              <AlertCircle className="h-3.5 w-3.5 mr-1" />
                              Not Found
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Certifications</span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.details.certifications.length > 0 ? (
                            analysis.details.certifications.map((cert, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {cert}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No certifications found</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {analysis.details.aiInsights && analysis.details.aiInsights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI Insights</h3>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <ul className="space-y-2">
                          {analysis.details.aiInsights.map((insight, index) => (
                            <li key={index} className="text-sm flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-700">Strengths</h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-amber-700">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      {analysis.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Application ID: {applicationData.id}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
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
