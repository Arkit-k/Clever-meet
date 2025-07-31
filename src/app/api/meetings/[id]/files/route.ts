import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify user has access to this meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    })

    if (!meeting || (meeting.clientId !== session.user.id && meeting.freelancerId !== session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const files = await prisma.file.findMany({
      where: { meetingId: id },
      include: {
        uploader: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify user has access to this meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    })

    if (!meeting || (meeting.clientId !== session.user.id && meeting.freelancerId !== session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Check file size (limit to 10MB for MVP)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // For MVP, store files in public/uploads directory
    // In production, use cloud storage like AWS S3
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, filename)
    
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error("Error writing file:", error)
      return NextResponse.json(
        { error: "Failed to save file" },
        { status: 500 }
      )
    }

    // Save file info to database
    const fileRecord = await prisma.file.create({
      data: {
        meetingId: id,
        uploaderId: session.user.id,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${filename}`
      },
      include: {
        uploader: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ file: fileRecord })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
