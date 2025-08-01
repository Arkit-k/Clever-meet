import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get verification status for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Find or create verification record
    let verification = await prisma.userVerification.findUnique({
      where: { userId: session.user.id }
    })

    if (!verification) {
      // Create default verification record
      verification = await prisma.userVerification.create({
        data: {
          userId: session.user.id,
          idVerification: 'UNVERIFIED',
          emailVerified: false,
          phoneVerified: false,
          portfolioVerified: false,
          backgroundCheck: 'UNVERIFIED'
        }
      })
    }

    // Calculate verification metrics
    const verificationScore = [
      verification.idVerification === 'VERIFIED',
      verification.emailVerified,
      verification.phoneVerified,
      verification.portfolioVerified,
      verification.backgroundCheck === 'VERIFIED'
    ].filter(Boolean).length

    const isFullyVerified = verificationScore === 5

    const trustLevel = 
      verificationScore >= 4 ? 'HIGHLY_TRUSTED' :
      verificationScore >= 3 ? 'VERIFIED' :
      verificationScore >= 2 ? 'PARTIALLY_VERIFIED' : 'UNVERIFIED'

    return NextResponse.json({
      success: true,
      verification,
      metrics: {
        verificationScore,
        totalChecks: 5,
        progressPercentage: (verificationScore / 5) * 100,
        isFullyVerified,
        trustLevel
      }
    })

  } catch (error) {
    console.error("Error fetching verification status:", error)
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    )
  }
}
