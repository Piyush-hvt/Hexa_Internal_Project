import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, Brain, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-3">
              <Brain className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Hexaview Resume Screening Platform</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Advanced AI-powered resume analysis and intelligent candidate screening system. Streamline your hiring
            process with precision matching and automated evaluation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/candidate">
              <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                Apply for Position
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" size="lg" className="px-8">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced NLP and machine learning algorithms analyze resumes against specific job descriptions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Smart Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Intelligent scoring system that matches candidates to job requirements with precision
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Dynamic Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Role-specific screening questions generated based on job descriptions and requirements
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Automated Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seamless integration with HR systems and automated candidate qualification process
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Hexaview Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose Position</h3>
              <p className="text-gray-600">
                Select from available positions with detailed job descriptions and requirements
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your resume against specific job requirements and generates detailed insights
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Testing</h3>
              <p className="text-gray-600">
                Take a customized screening test based on the specific position requirements
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">
                Get comprehensive feedback and automatic forwarding to HR for qualified candidates
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Powered by Advanced AI Technology</h2>
          <p className="text-lg mb-6 opacity-90">
            Hexaview uses cutting-edge natural language processing and machine learning to provide the most accurate
            resume analysis and candidate matching in the industry.
          </p>
          <div className="flex justify-center items-center space-x-8">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <span>Secure & Compliant</span>
            </div>
            <div className="flex items-center">
              <Brain className="h-6 w-6 mr-2" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-6 w-6 mr-2" />
              <span>Lightning Fast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
