"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const screeningQuestions = [
  {
    id: 1,
    question: "What is the primary purpose of unit testing?",
    options: [
      "To test the entire application",
      "To test individual components in isolation",
      "To test user interface",
      "To test database connections",
    ],
    correct: 1,
  },
  {
    id: 2,
    question: "Which HTTP status code indicates a successful request?",
    options: ["404", "500", "200", "301"],
    correct: 2,
  },
  {
    id: 3,
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Integration",
      "Automated Program Interaction",
      "Application Process Integration",
    ],
    correct: 0,
  },
  {
    id: 4,
    question: "In Agile methodology, what is a Sprint?",
    options: ["A type of testing", "A time-boxed iteration", "A project milestone", "A team meeting"],
    correct: 1,
  },
  {
    id: 5,
    question: "What is the purpose of version control systems like Git?",
    options: [
      "To compile code",
      "To track changes in code over time",
      "To test applications",
      "To deploy applications",
    ],
    correct: 1,
  },
  {
    id: 6,
    question: "What is the difference between smoke testing and sanity testing?",
    options: [
      "No difference, they are the same",
      "Smoke testing is broader, sanity testing is narrow and focused",
      "Sanity testing is broader, smoke testing is narrow",
      "Both are performed only on production",
    ],
    correct: 1,
  },
  {
    id: 7,
    question: "Which automation tool is primarily used for web application testing?",
    options: ["JUnit", "Selenium", "Postman", "Jenkins"],
    correct: 1,
  },
  {
    id: 8,
    question: "What is a test case?",
    options: [
      "A bug report",
      "A set of conditions to determine if a system works correctly",
      "A testing tool",
      "A type of documentation",
    ],
    correct: 1,
  },
  {
    id: 9,
    question: "In testing, what does UAT stand for?",
    options: [
      "Unit Acceptance Testing",
      "User Acceptance Testing",
      "Unified Application Testing",
      "Universal Access Testing",
    ],
    correct: 1,
  },
  {
    id: 10,
    question: "What is regression testing?",
    options: [
      "Testing new features only",
      "Re-testing the entire application from scratch",
      "Testing to ensure existing functionality works after changes",
      "Testing for performance issues",
    ],
    correct: 2,
  },
  {
    id: 11,
    question: "Which testing type focuses on the application's ability to handle expected load?",
    options: ["Functional testing", "Security testing", "Performance testing", "Usability testing"],
    correct: 2,
  },
  {
    id: 12,
    question: "What is a defect life cycle?",
    options: [
      "The time taken to fix a bug",
      "The process a defect goes through from discovery to closure",
      "The number of defects in a release",
      "The cost of fixing defects",
    ],
    correct: 1,
  },
  {
    id: 13,
    question: "In API testing, what does POST method typically do?",
    options: ["Retrieve data", "Update existing data", "Create new data", "Delete data"],
    correct: 2,
  },
  {
    id: 14,
    question: "What is boundary value analysis?",
    options: [
      "Testing only maximum values",
      "Testing values at the boundaries of input domains",
      "Testing random values",
      "Testing only minimum values",
    ],
    correct: 1,
  },
  {
    id: 15,
    question: "Which tool is commonly used for API testing?",
    options: ["Selenium", "Postman", "JMeter", "TestNG"],
    correct: 1,
  },
]

export default function ScreeningPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [timeLeft, setTimeLeft] = useState(1500) // 25 minutes for 15 questions
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleNext = () => {
    if (currentQuestion < screeningQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    const score = screeningQuestions.reduce((total, question) => {
      return total + (answers[question.id] === question.correct ? 100 / 15 : 0) // Each question worth ~6.67 points
    }, 0)

    // Get candidate data and update with screening score
    const candidateData = JSON.parse(localStorage.getItem("candidateData") || "{}")
    const updatedData = {
      ...candidateData,
      screeningScore: score,
      finalScore: candidateData.resumeScore + score,
      completedAt: new Date().toISOString(),
    }

    localStorage.setItem("candidateData", JSON.stringify(updatedData))
    setIsCompleted(true)

    // Simulate sending to HR if qualified
    if (updatedData.finalScore >= 140) {
      console.log("Sending qualified candidate to HR:", updatedData)
    }

    setTimeout(() => {
      router.push("/candidate/final-results")
    }, 2000)
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for completing the screening test. Your results are being processed.
            </p>
            <div className="animate-pulse text-sm text-gray-500">Redirecting to results...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / screeningQuestions.length) * 100
  const question = screeningQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Screening Test</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {screeningQuestions.length}
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestion + 1}</CardTitle>
            <CardDescription>{question.question}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswerSelect(question.id, Number.parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            Previous
          </Button>

          {currentQuestion === screeningQuestions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={answers[question.id] === undefined}>
              Submit Test
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={answers[question.id] === undefined}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
