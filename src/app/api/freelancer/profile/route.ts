import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const {
      title,
      description,
      hourlyRate,
      skills,
      experience,
      portfolio,
      integrations,
      availability,
      calLink,
      isActive
    } = await request.json()

    // Validate required fields
    if (!title || !description || !hourlyRate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const profile = await prisma.freelancerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        title,
        description,
        hourlyRate,
        skills,
        experience,
        portfolio,
        integrations,
        availability,
        calLink,
        isActive
      },
      create: {
        userId: session.user.id,
        title,
        description,
        hourlyRate,
        skills,
        experience,
        portfolio,
        integrations,
        availability,
        calLink,
        isActive
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error saving profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
