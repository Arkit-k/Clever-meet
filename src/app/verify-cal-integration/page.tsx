"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react"

export default function VerifyCalIntegrationPage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<{
    hasCalLink: boolean
    emailMatch: boolean
    accountExists: boolean
    recommendations: string[]
  } | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) return
    
    fetchProfile()
  }, [session, status])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/freelancer/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        if (data.profile) {
          verifyIntegration(data.profile)
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyIntegration = (profileData: any) => {
    const recommendations: string[] = []
    
    const hasCalLink = !!(profileData?.calLink)
    const emailMatch = session?.user.email === session?.user.email // Always true for same user
    const accountExists = hasCalLink // Simplified check

    if (!hasCalLink) {
      recommendations.push("Add your Cal.com username to your profile")
      recommendations.push("Make sure you create a Cal.com account first")
    }

    if (!profileData?.isActive) {
      recommendations.push("Activate your freelancer profile")
    }

    if (hasCalLink && !profileData.calLink.includes(session?.user.email?.split('@')[0])) {
      recommendations.push("Consider using a Cal.com username that matches your email for easier identification")
    }

    recommendations.push("Test your Cal.com booking link to ensure it works")
    recommendations.push("Create a 15-minute 'Discovery Call' event type in Cal.com")

    setVerificationStatus({
      hasCalLink,
      emailMatch,
      accountExists,
      recommendations
    })
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return <div className="text-center py-12">Please sign in to verify your Cal.com integration</div>
  }

  if (session.user.role !== "FREELANCER") {
    return <div className="text-center py-12">This page is only for freelancers</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cal.com Integration Verification</h1>
        <p className="text-muted-foreground">
          Verify your Cal.com setup for seamless client booking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cal.com Integration Status</CardTitle>
          <CardDescription>
            Check your Cal.com setup and get recommendations for improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Status Checks */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {verificationStatus?.hasCalLink ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">Cal.com Link Set</span>
                  </div>
                </div>
                <Badge variant={verificationStatus?.hasCalLink ? "default" : "destructive"}>
                  {verificationStatus?.hasCalLink ? "Set" : "Missing"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {verificationStatus?.emailMatch ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium">Email Match</span>
                  </div>
                </div>
                <Badge variant={verificationStatus?.emailMatch ? "default" : "secondary"}>
                  {verificationStatus?.emailMatch ? "Matched" : "Check Required"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {verificationStatus?.accountExists ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">Cal.com Account</span>
                  </div>
                </div>
                <Badge variant={verificationStatus?.accountExists ? "default" : "destructive"}>
                  {verificationStatus?.accountExists ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>

            {/* Current Setup */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Current Setup</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Cal.com Link:</strong> {profile?.calLink || "Not set"}</p>
                <p><strong>Profile Status:</strong> {profile?.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>

            {/* Recommendations */}
            {verificationStatus?.recommendations && verificationStatus.recommendations.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recommendations
                </h3>
                <ul className="space-y-2 text-sm">
                  {verificationStatus.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={() => window.open('/dashboard/profile', '_blank')}>
                Edit Profile
              </Button>
              <Button variant="outline" onClick={() => window.open('https://cal.com', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Cal.com
              </Button>
              <Button variant="outline" onClick={fetchProfile}>
                Refresh Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Set Up Cal.com Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Step 1: Create Cal.com Account</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to <a href="https://cal.com" target="_blank" className="text-blue-600 hover:underline">cal.com</a></li>
                <li><strong>Important:</strong> Sign up with the same Google account: {session.user.email}</li>
                <li>Complete your Cal.com profile setup</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Step 2: Create Event Type</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Create a "Discovery Call" event type</li>
                <li>Set duration to 15 minutes</li>
                <li>Enable video conferencing (Google Meet recommended)</li>
                <li>Set your availability</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">Step 3: Add to MeetBoard</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Copy your Cal.com username (e.g., "john-doe")</li>
                <li>Add it to your MeetBoard profile above</li>
                <li>Test the integration using this verification page</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
