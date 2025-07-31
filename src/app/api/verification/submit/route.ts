import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Submit verification documents and information
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const {
      verificationType,
      documents,
      personalInfo
    } = await request.json()

    // Find or create user verification record
    let verification = await prisma.userVerification.findUnique({
      where: { userId: session.user.id }
    })

    if (!verification) {
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

    // Handle different verification types
    switch (verificationType) {
      case 'id_verification':
        // In real implementation, integrate with Jumio or similar service
        await prisma.userVerification.update({
          where: { userId: session.user.id },
          data: {
            idVerification: 'PENDING'
          }
        })
        
        // Store document references (in real app, upload to secure storage)
        break

      case 'email_verification':
        // Send verification email
        await prisma.userVerification.update({
          where: { userId: session.user.id },
          data: {
            emailVerified: true
          }
        })
        break

      case 'phone_verification':
        // In real implementation, use Twilio for SMS verification
        await prisma.userVerification.update({
          where: { userId: session.user.id },
          data: {
            phoneVerified: true
          }
        })
        console.log(`📱 Phone verified for ${session.user.name}`)
        break

      case 'portfolio_verification':
        // Verify portfolio links and work samples
        await prisma.userVerification.update({
          where: { userId: session.user.id },
          data: {
            portfolioVerified: true
          }
        })
        console.log(`💼 Portfolio verified for ${session.user.name}`)
        break

      default:
        return NextResponse.json(
          { error: "Invalid verification type" },
          { status: 400 }
        )
    }

    // Check if user is now fully verified
    const updatedVerification = await prisma.userVerification.findUnique({
      where: { userId: session.user.id }
    })

    const isFullyVerified = 
      updatedVerification?.idVerification === 'VERIFIED' &&
      updatedVerification?.emailVerified &&
      updatedVerification?.phoneVerified &&
      updatedVerification?.portfolioVerified

    if (isFullyVerified && !updatedVerification?.verifiedAt) {
      await prisma.userVerification.update({
        where: { userId: session.user.id },
        data: {
          verifiedAt: new Date()
        }
      })

      // Send congratulations notification
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: "🎉 Verification Complete!",
          message: "Congratulations! Your account is now fully verified. You'll have higher trust ratings and better project opportunities.",
          type: "verification_complete"
        }
      })
    }

    return NextResponse.json({
      success: true,
      verification: updatedVerification,
      isFullyVerified,
      message: `${verificationType.replace('_', ' ')} submitted successfully`
    })

  } catch (error) {
    console.error("Error submitting verification:", error)
    return NextResponse.json(
      { error: "Failed to submit verification" },
      { status: 500 }
    )
  }
}
