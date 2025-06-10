"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, Trophy, Clock } from "lucide-react"
import Link from "next/link"

interface CandidateData {
  id: string
  name: string
  email: string
  jobRole: string
  resumeScore: number
  screeningScore: number
  finalScore: number
  submittedAt: string
  completedAt: string
}

export default function FinalResultsPage() {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null)
  const [isQualified, setIsQualified] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("candidateData")
    if (data) {
      const parsed = JSON.parse(data)
      setCandidateData(parsed)
      setIsQualified(parsed.finalScore >= 140)
    }
  }, [])

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {isQualified ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <CheckCircle className="h-16 w-16 text-blue-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Complete!</h1>
          <p className="text-gray-600">
            Here are your final results for the {candidateData.jobRole.replace("-", " ")} position
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Final Score
                <Badge variant={isQualified ? "default" : "secondary"} className="text-lg px-3 py-1">
                  {candidateData.finalScore}/200
                </Badge>
              </CardTitle>
              <CardDescription>Combined resume analysis and screening test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(candidateData.resumeScore, 100)}`}>
                      {candidateData.resumeScore}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Resume Score</div>
                    <Progress value={candidateData.resumeScore} className="mt-2 h-2" />
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(candidateData.screeningScore, 100)}`}>
                      {candidateData.screeningScore}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Screening Score</div>
                    <Progress value={candidateData.screeningScore} className="mt-2 h-2" />
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(candidateData.finalScore, 200)}`}>
                      {candidateData.finalScore}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Final Score</div>
                    <Progress value={(candidateData.finalScore / 200) * 100} className="mt-2 h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {isQualified ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                ) : (
                  <Mail className="h-6 w-6 text-blue-600 mr-2" />
                )}
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isQualified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 mb-3 text-lg">
                    🎉 Congratulations! You've been shortlisted!
                  </h3>
                  <div className="space-y-2 text-green-700">
                    <p>✅ Your application has been automatically forwarded to our HR team</p>
                    <p>✅ You'll receive an email confirmation shortly</p>
                    <p>✅ Our team will contact you within 2-3 business days</p>
                  </div>
                  <div className="mt-4 p-3 bg-green-100 rounded border-l-4 border-green-500">
                    <p className="text-sm text-green-800">
                      <strong>Next Steps:</strong> Keep an eye on your email for interview scheduling and additional
                      information about the role.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-800 mb-3 text-lg">Thank you for your application</h3>
                  <div className="space-y-2 text-blue-700">
                    <p>Your application has been received and reviewed</p>
                    <p>While you didn't meet the threshold for this specific role, we encourage you to:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Apply for other positions that match your skills</li>
                      <li>Consider gaining additional experience in key areas</li>
                      <li>Reapply in the future as you develop your skills</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Resume Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Skills Match:</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience Level:</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Keywords:</span>
                      <span className="font-medium">92%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Screening Test</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Questions Answered:</span>
                      <span className="font-medium">15/15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Correct Answers:</span>
                      <span className="font-medium">{Math.round((candidateData.screeningScore * 15) / 100)}/15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Taken:</span>
                      <span className="font-medium">22 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
