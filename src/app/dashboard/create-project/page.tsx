"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, DollarSign, Calendar, Shield } from "lucide-react"

interface Milestone {
  title: string
  description: string
  amount: number
  dueDate: string
}

export default function CreateProjectPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [project, setProject] = useState({
    freelancerId: "",
    title: "",
    description: "",
    totalAmount: 0,
    startDate: "",
    endDate: ""
  })
  
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", description: "", amount: 0, dueDate: "" }
  ])

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", amount: 0, dueDate: "" }])
  }

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index))
    }
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  const calculateTotal = () => {
    return milestones.reduce((sum, milestone) => sum + (milestone.amount || 0), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const totalAmount = calculateTotal()
      
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...project,
          totalAmount,
          milestones
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert("🎉 Project created successfully! Freelancer will be notified.")
        router.push("/dashboard/projects")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error creating project:", error)
      alert("Failed to create project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (session?.user.role !== "CLIENT") {
    return (
      <div className="text-center py-12">
        <p>Only clients can create projects.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Create Secure Project</h1>
          <p className="text-muted-foreground">
            Protected by ClearAway's escrow system - payments released only when milestones are completed
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Define your project scope and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="freelancerId">Freelancer ID</Label>
              <Input
                id="freelancerId"
                placeholder="Enter freelancer ID (from their profile)"
                value={project.freelancerId}
                onChange={(e) => setProject({...project, freelancerId: e.target.value})}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can find this on the freelancer's profile page
              </p>
            </div>

            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="e.g., E-commerce Website Development"
                value={project.title}
                onChange={(e) => setProject({...project, title: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of what you need..."
                value={project.description}
                onChange={(e) => setProject({...project, description: e.target.value})}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={project.startDate}
                  onChange={(e) => setProject({...project, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={project.endDate}
                  onChange={(e) => setProject({...project, endDate: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Project Milestones
            </CardTitle>
            <CardDescription>
              Break your project into milestones. Payments are escrowed and released when each milestone is completed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Milestone {index + 1}</h4>
                  {milestones.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Milestone Title</Label>
                    <Input
                      placeholder="e.g., Design Mockups"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, "title", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={milestone.amount || ""}
                      onChange={(e) => updateMilestone(index, "amount", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="What will be delivered in this milestone?"
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, "description", e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Project Value:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                💡 This amount will be escrowed and released as milestones are completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || calculateTotal() === 0}
            className="flex-1"
          >
            {isLoading ? "Creating Project..." : "Create Secure Project"}
          </Button>
        </div>
      </form>
    </div>
  )
}
