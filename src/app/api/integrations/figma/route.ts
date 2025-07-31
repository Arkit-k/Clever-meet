import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Figma webhook endpoint to track design activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const payload = await request.json()
    
    // Handle Figma webhook events
    const eventType = payload.event_type
    
    switch (eventType) {
      case 'FILE_UPDATE':
        console.log(`🎨 Figma: File updated by ${session.user.name}`)
        break
        
      case 'FILE_COMMENT':
        console.log(`💬 Figma: Comment added by ${session.user.name}`)
        break
        
      case 'FILE_VERSION_UPDATE':
        console.log(`📝 Figma: New version created by ${session.user.name}`)
        break
        
      default:
        console.log(`🎨 Figma: ${eventType} event received`)
    }

    return NextResponse.json({
      success: true,
      message: "Figma webhook processed"
    })

  } catch (error) {
    console.error("Error processing Figma webhook:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

// Get Figma activity for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Mock Figma activity data
    const mockActivity = [
      {
        id: "1",
        type: "file_update",
        description: "Updated homepage wireframes",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        fileName: "Project Wireframes",
        fileUrl: "https://figma.com/file/example"
      },
      {
        id: "2",
        type: "comment",
        description: "Added feedback on user flow",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        fileName: "User Journey Map"
      },
      {
        id: "3",
        type: "version_update",
        description: "Created new design version",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        fileName: "Mobile App Design"
      }
    ]

    return NextResponse.json({
      success: true,
      activity: mockActivity,
      stats: {
        filesUpdated: 3,
        currentlyWorking: "Homepage mockup",
        lastActivity: mockActivity[0]?.timestamp
      }
    })

  } catch (error) {
    console.error("Error fetching Figma activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    )
  }
}
