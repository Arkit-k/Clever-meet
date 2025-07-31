"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestMeetingPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testMeetingRequest = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // First, get a freelancer to test with
      const freelancersResponse = await fetch("/api/freelancers")
      const freelancersData = await freelancersResponse.json()
      
      if (!freelancersData.freelancers || freelancersData.freelancers.length === 0) {
        setResult({ error: "No freelancers found. Create a freelancer profile first." })
        return
      }

      const testFreelancer = freelancersData.freelancers[0]
      
      // Create a test meeting request
      const meetingResponse = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freelancerId: testFreelancer.userId,
          title: "Test Meeting Request",
          description: "This is a test meeting to verify the notification system",
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration: 60
        }),
      })

      const meetingData = await meetingResponse.json()
      
      if (meetingResponse.ok) {
        setResult({
          success: true,
          meeting: meetingData.meeting,
          freelancer: testFreelancer
        })
      } else {
        setResult({ error: meetingData.error || "Failed to create meeting" })
      }
    } catch (error) {
      setResult({ error: "Network error: " + error })
    } finally {
      setIsLoading(false)
    }
  }

  const checkNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()
      setResult({ notifications: data.notifications })
    } catch (error) {
      setResult({ error: "Failed to fetch notifications" })
    }
  }

  if (!session) {
    return <div className="p-6">Please sign in to test meeting requests</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Meeting Request System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testMeetingRequest} 
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Test Meeting Request"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={checkNotifications}
            >
              Check My Notifications
            </Button>
          </div>

          {result && (
            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to test:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Make sure you have both a client and freelancer account</li>
              <li>Sign in as a client and click "Create Test Meeting Request"</li>
              <li>Switch to the freelancer account and check notifications</li>
              <li>Go to the freelancer's meetings page to see the request</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
