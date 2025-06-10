"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Lock, User, AlertCircle, Info } from "lucide-react"

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        // Store auth token/session
        localStorage.setItem("adminAuth", JSON.stringify(data.user))
        router.push("/admin")
      } else {
        setError(data.error || "Invalid credentials")
        if (data.error?.includes("admin_users") || data.error?.includes("relation")) {
          setShowSetup(true)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
      setShowSetup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupAdmin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setShowSetup(false)
        setError("")
        // Try to login again with the demo credentials
        setCredentials({ username: "admin", password: "admin123" })
      } else {
        setError(data.error || "Failed to setup admin user")
      }
    } catch (error) {
      console.error("Setup error:", error)
      setError("Setup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-3">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Hexaview Admin</CardTitle>
            </div>
          </div>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showSetup && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  It looks like the database isn't set up yet. Click the setup button below to initialize the admin
                  user.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {showSetup && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSetupAdmin}
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Setup Admin User"}
              </Button>
            )}
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-500">Username: admin</p>
            <p className="text-xs text-gray-500">Password: admin123</p>
            <p className="text-xs text-gray-400 mt-2">These credentials work even without database setup</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
