import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20"
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Only clients can create payments
    if (session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: "Only clients can create payments" },
        { status: 403 }
      )
    }

    const { projectId, milestoneId, amount, description } = await request.json()

    // Validate required fields
    if (!projectId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Project ID and valid amount are required" },
        { status: 400 }
      )
    }

    // Get project and verify client access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        freelancer: true,
        milestones: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (project.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // If milestone specified, verify it exists and belongs to project
    let milestone = null
    if (milestoneId) {
      milestone = project.milestones.find(m => m.id === milestoneId)
      if (!milestone) {
        return NextResponse.json(
          { error: "Milestone not found" },
          { status: 404 }
        )
      }
    }

    // Create Stripe payment intent
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        projectId: project.id,
        milestoneId: milestoneId || '',
        clientId: session.user.id,
        freelancerId: project.freelancerId,
        description: description || `Payment for ${project.title}`
      },
      description: description || `Payment for ${project.title}`,
      receipt_email: session.user.email
    })

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        projectId: project.id,
        milestoneId: milestoneId || null,
        meetingId: null, // This is for project payments, not meeting payments
        payerId: session.user.id,
        recipientId: project.freelancerId,
        amount: amount,
        currency: 'USD',
        status: 'PENDING',
        paymentMethod: 'STRIPE',
        stripePaymentIntentId: paymentIntent.id,
        description: description || `Payment for ${project.title}`
      }
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: amount,
      currency: 'USD'
    })

  } catch (error) {
    console.error('Stripe payment intent creation error:', error)
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}
