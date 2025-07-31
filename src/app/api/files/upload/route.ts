import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const meetingId = formData.get('meetingId') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported" },
        { status: 400 }
      )
    }

    // Verify project/meeting access
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        )
      }

      if (project.clientId !== session.user.id && project.freelancerId !== session.user.id) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }
    }

    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId }
      })

      if (!meeting) {
        return NextResponse.json(
          { error: "Meeting not found" },
          { status: 404 }
        )
      }

      if (meeting.clientId !== session.user.id && meeting.freelancerId !== session.user.id) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "freelance-meetboard",
          public_id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    }) as any

    // Save file record to database
    const fileRecord = await prisma.file.create({
      data: {
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        uploadedById: session.user.id,
        projectId: projectId || null,
        meetingId: meetingId || null,
        description: description || null
      }
    })

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        url: fileRecord.url,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        uploadedAt: fileRecord.createdAt
      },
      message: "File uploaded successfully"
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const meetingId = searchParams.get('meetingId')

    let whereClause: any = {}

    if (projectId) {
      // Verify project access
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })

      if (!project || (project.clientId !== session.user.id && project.freelancerId !== session.user.id)) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }

      whereClause.projectId = projectId
    }

    if (meetingId) {
      // Verify meeting access
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId }
      })

      if (!meeting || (meeting.clientId !== session.user.id && meeting.freelancerId !== session.user.id)) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }

      whereClause.meetingId = meetingId
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
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

    return NextResponse.json({
      success: true,
      files: files
    })

  } catch (error) {
    console.error('File fetch error:', error)
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    )
  }
}
