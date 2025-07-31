"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save, Calendar } from "lucide-react"
import { VerificationBadge, VerificationProgress } from "@/components/verification-badge"
import { Integrations, Integration } from "@/components/integrations"

interface FreelancerProfile {
  id?: string
  title: string
  description: string
  hourlyRate: number
  skills: string[]
  experience: string
  portfolio: PortfolioItem[]
  integrations: Integration[]
  availability: any
  isActive: boolean
}

interface PortfolioItem {
  title: string
  description: string
  url?: string
  image?: string
}

export default function FreelancerProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [profile, setProfile] = useState<FreelancerProfile>({
    title: "",
    description: "",
    hourlyRate: 50,
    skills: [],
    experience: "",
    portfolio: [],
    integrations: [],
    availability: null,
    isActive: true
  })
  const [calLink, setCalLink] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "FREELANCER") {
      router.push("/dashboard")
      return
    }
    
    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/freelancer/profile")
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setProfile({
            ...data.profile,
            skills: JSON.parse(data.profile.skills || "[]"),
            portfolio: JSON.parse(data.profile.portfolio || "[]"),
            integrations: JSON.parse(data.profile.integrations || "[]")
          })
          setCalLink(data.profile.calLink || "")
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/freelancer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          skills: JSON.stringify(profile.skills),
          portfolio: JSON.stringify(profile.portfolio),
          integrations: JSON.stringify(profile.integrations),
          calLink: calLink
        }),
      })

      if (response.ok) {
        alert("Profile saved successfully!")
      } else {
        alert("Failed to save profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addPortfolioItem = () => {
    setProfile(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, { title: "", description: "", url: "" }]
    }))
  }

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: string) => {
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removePortfolioItem = (index: number) => {
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }))
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {session?.user.name}'s Profile
            <VerificationBadge profile={{...profile, calLink}} size="md" />
          </h1>
          <div className="mt-2">
            <VerificationProgress profile={{...profile, calLink}} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Tell clients about yourself and your services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Professional Title</Label>
            <Input
              id="title"
              placeholder="e.g., Full-Stack Developer, UI/UX Designer"
              value={profile.title}
              onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your expertise, experience, and what makes you unique..."
              value={profile.description}
              onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>
          
          <div>
            <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="1"
              value={profile.hourlyRate}
              onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
            />
          </div>
          
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              placeholder="Describe your relevant work experience, education, and achievements..."
              value={profile.experience}
              onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Add your technical and professional skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
            />
            <Button onClick={addSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>Showcase your best work and projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.portfolio.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Project {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePortfolioItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Project Title</Label>
                  <Input
                    placeholder="Project name"
                    value={item.title}
                    onChange={(e) => updatePortfolioItem(index, "title", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Project URL (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={item.url || ""}
                    onChange={(e) => updatePortfolioItem(index, "url", e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the project, your role, and technologies used..."
                  value={item.description}
                  onChange={(e) => updatePortfolioItem(index, "description", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
          
          <Button onClick={addPortfolioItem} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Portfolio Item
          </Button>
        </CardContent>
      </Card>

      {/* Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Integration</CardTitle>
          <CardDescription>Connect your Cal.com account so clients can book meetings directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="calLink">Cal.com Username or Link</Label>
            <Input
              id="calLink"
              placeholder="e.g., your-username or https://cal.com/your-username"
              value={calLink}
              onChange={(e) => setCalLink(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Enter your Cal.com username (e.g., "john-doe") or full Cal.com link
            </p>
            <div className="bg-red-50 p-3 rounded mt-2">
              <p className="text-sm text-red-700">
                <strong>⚠️ Remember:</strong> Your Cal.com account must be connected to <code>{session?.user.email}</code>
                for the integration to work properly.
              </p>
            </div>
          </div>

          {calLink && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Preview</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Clients will see a "Book Meeting" button that opens your Cal.com booking page
              </p>
              <div className="bg-background p-4 rounded border">
                <p className="text-sm mb-3 flex items-center gap-2">
                  Book a meeting with {session?.user.name}
                  <VerificationBadge profile={{...profile, calLink}} size="sm" />
                </p>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                  📅 Book Meeting
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">⚠️ IMPORTANT: Use the Same Google Account</h4>
            <div className="bg-yellow-100 p-3 rounded mb-3">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                📧 Your Cliverside email: <code>{session?.user.email}</code>
              </p>
              <p className="text-sm text-yellow-700">
                You MUST use this same Google account when setting up Cal.com for proper integration.
              </p>
            </div>
            <ol className="text-sm space-y-1 list-decimal list-inside text-blue-800">
              <li>Go to <a href="https://cal.com" target="_blank" className="text-blue-600 hover:underline">cal.com</a></li>
              <li><strong>Sign up/login with the SAME Google account:</strong> {session?.user.email}</li>
              <li>Create a 15-minute "Discovery Call" event type</li>
              <li>Copy your Cal.com username and paste it above</li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">🚀 Streamlined Process:</h4>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>Clients book 15-minute discovery calls via Cal.com</li>
              <li>You discuss their project during the call</li>
              <li>Client makes instant decision: Approve or Pass</li>
              <li><strong>If approved:</strong> Meeting Board opens immediately for collaboration!</li>
              <li><strong>If passed:</strong> Both move on to find better matches</li>
            </ol>
            <p className="text-sm text-green-700 mt-2">
              <strong>Tip:</strong> Set up a 15-minute "Discovery Call" event type in Cal.com. No complex booking needed!
            </p>
          </div>

          <div>
            <Label>Backup Availability Info</Label>
            <Textarea
              placeholder="e.g., Monday-Friday 9AM-5PM EST, or contact me for custom times"
              value={profile.availability || ""}
              onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value }))}
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              This will be shown if Cal.com integration is not available
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Integrations */}
      <Integrations
        integrations={profile.integrations}
        onUpdate={(integrations) => setProfile(prev => ({ ...prev, integrations }))}
        isEditing={true}
      />
    </div>
  )
}
