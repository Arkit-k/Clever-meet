import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  })
}

// Release escrow payment to freelancer after milestone approval
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Only clients can release escrow payments" },
        { status: 401 }
      )
    }

    const { paymentId, milestoneId, feedback } = await request.json()

    // Find the escrowed payment
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        clientId: session.user.id,
        status: 'ESCROWED'
      },
      include: {
        project: true,
        milestone: true,
        freelancer: { select: { name: true, email: true } }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Escrowed payment not found" },
        { status: 404 }
      )
    }

    // Verify milestone is completed
    if (payment.milestone?.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: "Milestone must be marked as completed before payment release" },
        { status: 400 }
      )
    }

    // Capture the Stripe payment (release from escrow)
    // Note: In real implementation, you'd store the payment_intent_id in the payment record
    // const captureResult = await stripe.paymentIntents.capture(payment.stripePaymentIntentId)

    // Update payment status to released
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
        description: feedback ? 
          `${payment.description}\n\nClient feedback: ${feedback}` : 
          payment.description
      }
    })

    // Update milestone status to approved
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'APPROVED' }
    })

    // Create notification for freelancer
    await prisma.notification.create({
      data: {
        userId: payment.freelancerId,
        title: "Payment Released! 💰",
        message: `Your payment of $${payment.amount} has been released for milestone: ${payment.milestone?.title}`,
        type: "payment_released"
      }
    })

    console.log(`✅ Payment released: $${payment.amount} to ${payment.freelancer.name}`)

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: `Payment of $${payment.amount} has been released to ${payment.freelancer.name}`
    })

  } catch (error) {
    console.error("Error releasing escrow payment:", error)
    return NextResponse.json(
      { error: "Failed to release payment" },
      { status: 500 }
    )
  }
}
