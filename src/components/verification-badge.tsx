"use client"

import { Badge } from "@/components/ui/badge"
import { Award, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FreelancerProfile {
  title?: string
  description?: string
  hourlyRate?: number
  skills?: string[]
  experience?: string
  portfolio?: any[]
  integrations?: any[]
  calLink?: string
}

interface VerificationBadgeProps {
  profile?: FreelancerProfile
  size?: "sm" | "md" | "lg"
  className?: string
  showText?: boolean
}

export function VerificationBadge({ 
  profile, 
  size = "sm", 
  className,
  showText = false 
}: VerificationBadgeProps) {
  if (!profile) return null

  // Calculate verification steps completion
  const verificationSteps = [
    !!(profile.title && profile.description && profile.hourlyRate && profile.experience), // Basic info
    !!(profile.skills && profile.skills.length >= 3), // Skills
    !!(profile.portfolio && profile.portfolio.length >= 1), // Portfolio
    !!(profile.calLink && profile.calLink.trim()) // Calendar
  ]

  const completedSteps = verificationSteps.filter(Boolean).length
  const isFullyVerified = completedSteps === 4

  if (!isFullyVerified) return null

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  }

  const iconSize = sizeClasses[size]

  if (showText) {
    return (
      <Badge className={cn("bg-green-600 text-white gap-1", className)}>
        <Award className={iconSize} />
        Verified
      </Badge>
    )
  }

  return (
    <div className={cn("inline-flex items-center", className)} title="Verified Freelancer">
      <Award className={cn("text-green-600", iconSize)} />
    </div>
  )
}

// Hook to check if a freelancer is verified
export function useIsVerified(profile?: FreelancerProfile): boolean {
  if (!profile) return false

  const verificationSteps = [
    !!(profile.title && profile.description && profile.hourlyRate && profile.experience),
    !!(profile.skills && profile.skills.length >= 3),
    !!(profile.portfolio && profile.portfolio.length >= 1),
    !!(profile.calLink && profile.calLink.trim())
  ]

  return verificationSteps.filter(Boolean).length === 4
}

// Component to show verification progress
export function VerificationProgress({ profile }: { profile?: FreelancerProfile }) {
  if (!profile) return null

  const verificationSteps = [
    !!(profile.title && profile.description && profile.hourlyRate && profile.experience),
    !!(profile.skills && profile.skills.length >= 3),
    !!(profile.portfolio && profile.portfolio.length >= 1),
    !!(profile.calLink && profile.calLink.trim())
  ]

  const completedSteps = verificationSteps.filter(Boolean).length
  const progress = (completedSteps / 4) * 100

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm text-muted-foreground">
        {completedSteps}/4
      </span>
    </div>
  )
}
