import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log(`🔍 DEBUG: Current user - ${session.user.name} (${session.user.id}) - Role: ${session.user.role}`)

    // Get all meetings in the database
    const allMeetings = await prisma.meeting.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`🔍 DEBUG: Total meetings in database: ${allMeetings.length}`)

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log(`🔍 DEBUG: Total users in database: ${allUsers.length}`)

    // Get meetings for current user
    const whereClause = session.user.role === "CLIENT"
      ? { clientId: session.user.id }
      : { freelancerId: session.user.id }

    const userMeetings = await prisma.meeting.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`🔍 DEBUG: Meetings for current user: ${userMeetings.length}`)

    // Get freelancer profiles
    const freelancerProfiles = await prisma.freelancerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`🔍 DEBUG: Freelancer profiles: ${freelancerProfiles.length}`)

    return NextResponse.json({
      debug: {
        currentUser: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role
        },
        totalMeetings: allMeetings.length,
        totalUsers: allUsers.length,
        userMeetings: userMeetings.length,
        freelancerProfiles: freelancerProfiles.length
      },
      allMeetings: allMeetings.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        clientId: m.clientId,
        freelancerId: m.freelancerId,
        client: m.client,
        freelancer: m.freelancer,
        scheduledAt: m.scheduledAt,
        createdAt: m.createdAt
      })),
      allUsers,
      userMeetings: userMeetings.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        clientId: m.clientId,
        freelancerId: m.freelancerId,
        client: m.client,
        freelancer: m.freelancer
      })),
      freelancerProfiles: freelancerProfiles.map(fp => ({
        id: fp.id,
        userId: fp.userId,
        calLink: fp.calLink,
        user: fp.user
      }))
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
