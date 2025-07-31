"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, AlertTriangle, Clock, Award } from "lucide-react"

interface FreelancerProfile {
  title?: string
  description?: string
  hourlyRate?: number
  skills?: string[]
  experience?: string
  portfolio?: any[]
  calLink?: string
}

interface TrustBadgeProps {
  profile?: FreelancerProfile
  size?: "sm" | "md" | "lg"
  showDetails?: boolean
}

export function TrustBadge({ profile, size = "md", showDetails = false }: TrustBadgeProps) {
  if (!profile) {
    return (
      <Badge variant="secondary" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Unverified
      </Badge>
    )
  }

  // Calculate verification steps completion
  const verificationSteps = [
    !!(profile.title && profile.description && profile.hourlyRate && profile.experience), // Basic info
    !!(profile.skills && profile.skills.length >= 3), // Skills
    !!(profile.portfolio && profile.portfolio.length >= 1), // Portfolio
    !!(profile.calLink && profile.calLink.trim()) // Calendar
  ]

  const completedSteps = verificationSteps.filter(Boolean).length
  const isFullyVerified = completedSteps === 4

  if (isFullyVerified) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-green-600 text-white gap-1">
          <Award className="h-3 w-3" />
          Verified
        </Badge>

        {showDetails && (
          <div className="text-xs text-muted-foreground">
            <div className="flex gap-1">
              <span>👤</span> {/* Basic Info */}
              <span>⭐</span> {/* Skills */}
              <span>💼</span> {/* Portfolio */}
              <span>📅</span> {/* Calendar */}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <Clock className="h-3 w-3" />
      {completedSteps}/4 Complete
    </Badge>
  )
}

// Verification status component for profile pages
export function VerificationStatus({ verification }: { verification: any }) {
  const verificationItems = [
    {
      label: "ID Verification",
      status: verification?.idVerification || 'UNVERIFIED',
      icon: "🆔",
      description: "Government-issued ID verified"
    },
    {
      label: "Email Verified",
      status: verification?.emailVerified ? 'VERIFIED' : 'UNVERIFIED',
      icon: "📧",
      description: "Email address confirmed"
    },
    {
      label: "Phone Verified",
      status: verification?.phoneVerified ? 'VERIFIED' : 'UNVERIFIED',
      icon: "📱",
      description: "Phone number confirmed"
    },
    {
      label: "Portfolio Verified",
      status: verification?.portfolioVerified ? 'VERIFIED' : 'UNVERIFIED',
      icon: "💼",
      description: "Work samples and portfolio validated"
    },
    {
      label: "Background Check",
      status: verification?.backgroundCheck || 'UNVERIFIED',
      icon: "🔍",
      description: "Professional background verified"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'text-green-600'
      case 'PENDING': return 'text-yellow-600'
      case 'REJECTED': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VERIFIED': return '✅ Verified'
      case 'PENDING': return '⏳ Pending'
      case 'REJECTED': return '❌ Rejected'
      default: return '⚪ Not Started'
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Verification Status</h3>
      <div className="space-y-2">
        {verificationItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
              {getStatusText(item.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
