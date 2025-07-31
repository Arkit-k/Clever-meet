"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, DollarSign, Calendar, User, Shield, AlertTriangle } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  totalAmount: number
  status: string
  startDate: string
  endDate: string
  createdAt: string
  client: { name: string; email: string }
  freelancer: { name: string; email: string }
  milestones: Array<{
    id: string
    title: string
    amount: number
    status: string
    dueDate: string
  }>
}

export default function ProjectsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-600'
      case 'COMPLETED': return 'bg-blue-600'
      case 'DISPUTED': return 'bg-red-600'
      case 'CANCELLED': return 'bg-gray-600'
      default: return 'bg-yellow-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DISPUTED': return <AlertTriangle className="h-4 w-4" />
      case 'ACTIVE': return <Shield className="h-4 w-4" />
      default: return null
    }
  }

  const calculateProgress = (milestones: any[]) => {
    if (milestones.length === 0) return 0
    const completed = milestones.filter(m => m.status === 'APPROVED').length
    return (completed / milestones.length) * 100
  }

  const calculateEarnings = (milestones: any[]) => {
    return milestones
      .filter(m => m.status === 'APPROVED')
      .reduce((sum, m) => sum + m.amount, 0)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading projects...</div>
  }

  const isClient = session?.user.role === "CLIENT"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isClient ? "My Projects" : "Project Assignments"}
          </h1>
          <p className="text-muted-foreground">
            {isClient 
              ? "Manage your projects with escrow protection" 
              : "View your project assignments and milestones"
            }
          </p>
        </div>
        
        {isClient && (
          <Button onClick={() => router.push("/dashboard/create-project")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              {isClient 
                ? "Create your first secure project with milestone-based payments" 
                : "Project assignments will appear here when clients hire you"
              }
            </p>
            {isClient && (
              <Button onClick={() => router.push("/dashboard/create-project")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {project.title}
                      <Badge className={`${getStatusColor(project.status)} text-white`}>
                        {getStatusIcon(project.status)}
                        {project.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${project.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Value
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {isClient ? `Freelancer: ${project.freelancer.name}` : `Client: ${project.client.name}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No start date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      ${calculateEarnings(project.milestones).toFixed(2)} earned
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {project.milestones.filter(m => m.status === 'APPROVED').length} / {project.milestones.length} milestones
                    </span>
                  </div>
                  <Progress value={calculateProgress(project.milestones)} className="h-2" />
                </div>

                {/* Milestones Preview */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {project.milestones.slice(0, 3).map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between text-sm">
                        <span className="flex-1">{milestone.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${milestone.amount}</span>
                          <Badge 
                            variant={milestone.status === 'APPROVED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {project.milestones.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{project.milestones.length - 3} more milestones
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {project.status === 'CLIENT_APPROVED' && (
                    <>
                      <Button
                        onClick={() => router.push(`/projects/${project.id}/meetboard`)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        🚀 Open Meetboard
                      </Button>
                      {session?.user.role === 'CLIENT' && (
                        <Button
                          onClick={() => router.push(`/projects/${project.id}/client-hub`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          🎛️ Client Hub
                        </Button>
                      )}
                    </>
                  )}
                  {project.status === 'ACTIVE' && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      disabled
                    >
                      ⏳ Awaiting Approval
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
