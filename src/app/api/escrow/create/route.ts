import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  })
}

// Create escrow payment - money is held until milestone completion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Only clients can create escrow payments" },
        { status: 401 }
      )
    }

    const {
      projectId,
      milestoneId,
      amount,
      description,
      paymentMethodId
    } = await request.json()

    // Validate inputs
    if (!projectId || !milestoneId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment details" },
        { status: 400 }
      )
    }

    // Verify project ownership and milestone
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        clientId: session.user.id
      },
      include: {
        freelancer: true,
        milestones: {
          where: { id: milestoneId }
        }
      }
    })

    if (!project || project.milestones.length === 0) {
      return NextResponse.json(
        { error: "Project or milestone not found" },
        { status: 404 }
      )
    }

    const milestone = project.milestones[0]

    // Create Stripe Payment Intent with manual capture (escrow)
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      capture_method: 'manual', // This is key - we don't capture until milestone completion
      metadata: {
        projectId,
        milestoneId,
        clientId: session.user.id,
        freelancerId: project.freelancerId,
        type: 'escrow_payment'
      },
      description: `Escrow payment for: ${description || milestone.title}`
    })

    // Create payment record in our database
    const payment = await prisma.payment.create({
      data: {
        projectId,
        milestoneId,
        clientId: session.user.id,
        freelancerId: project.freelancerId,
        amount,
        status: 'ESCROWED',
        description: description || `Payment for milestone: ${milestone.title}`,
        escrowedAt: new Date(),
        // Store Stripe payment intent ID for later capture
        // We'll add this field to the Payment model
      }
    })

    // Update milestone status
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'IN_PROGRESS' }
    })

    console.log(`💰 Escrow payment created: $${amount} for milestone ${milestone.title}`)

    return NextResponse.json({
      success: true,
      payment,
      escrowStatus: 'HELD',
      message: `$${amount} has been escrowed and will be released when the milestone is completed and approved.`
    })

  } catch (error) {
    console.error("Error creating escrow payment:", error)
    return NextResponse.json(
      { error: "Failed to create escrow payment" },
      { status: 500 }
    )
  }
}
