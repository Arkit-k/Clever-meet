import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

// Initialize Stripe
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
    const stripe = getStripe()
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      console.error("❌ No Stripe signature found")
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ STRIPE_WEBHOOK_SECRET not configured")
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    console.log("✅ Stripe webhook received:", event.type)

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Stripe webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("💰 Payment succeeded:", paymentIntent.id)

    // Find the payment record in our database
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      },
      include: {
        project: {
          include: {
            client: true,
            freelancer: true
          }
        }
      }
    })

    if (!payment) {
      console.error("❌ Payment not found for PaymentIntent:", paymentIntent.id)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        paidAt: new Date()
      }
    })

    // Notify both parties
    await createNotification(
      payment.project.clientId,
      "Payment Successful! 💰",
      `Your payment of $${payment.amount} for "${payment.project.title}" has been processed successfully.`,
      "payment_success"
    )

    await createNotification(
      payment.project.freelancerId,
      "Payment Received! 🎉",
      `Payment of $${payment.amount} for "${payment.project.title}" has been received and is being held in escrow.`,
      "payment_received"
    )

    console.log("✅ Payment success notifications sent")
  } catch (error) {
    console.error("❌ Error handling payment success:", error)
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("❌ Payment failed:", paymentIntent.id)

    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      },
      include: {
        project: {
          include: {
            client: true,
            freelancer: true
          }
        }
      }
    })

    if (!payment) {
      console.error("❌ Payment not found for PaymentIntent:", paymentIntent.id)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED"
      }
    })

    // Notify client about failed payment
    await createNotification(
      payment.project.clientId,
      "Payment Failed ❌",
      `Your payment of $${payment.amount} for "${payment.project.title}" could not be processed. Please check your payment method and try again.`,
      "payment_failed"
    )

    console.log("✅ Payment failure notification sent")
  } catch (error) {
    console.error("❌ Error handling payment failure:", error)
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("🚫 Payment canceled:", paymentIntent.id)

    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      },
      include: {
        project: {
          include: {
            client: true,
            freelancer: true
          }
        }
      }
    })

    if (!payment) {
      console.error("❌ Payment not found for PaymentIntent:", paymentIntent.id)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CANCELLED"
      }
    })

    // Notify both parties
    await createNotification(
      payment.project.clientId,
      "Payment Canceled 🚫",
      `Your payment of $${payment.amount} for "${payment.project.title}" has been canceled.`,
      "payment_canceled"
    )

    console.log("✅ Payment cancellation notification sent")
  } catch (error) {
    console.error("❌ Error handling payment cancellation:", error)
  }
}

// Handle dispute created
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log("⚠️ Dispute created:", dispute.id)

    // Find the payment associated with this charge
    const payment = await prisma.payment.findFirst({
      where: {
        stripeChargeId: dispute.charge as string
      },
      include: {
        project: {
          include: {
            client: true,
            freelancer: true
          }
        }
      }
    })

    if (!payment) {
      console.error("❌ Payment not found for dispute charge:", dispute.charge)
      return
    }

    // Create dispute record
    await prisma.dispute.create({
      data: {
        projectId: payment.projectId,
        paymentId: payment.id,
        stripeDisputeId: dispute.id,
        reason: dispute.reason,
        status: "OPEN",
        amount: dispute.amount / 100, // Convert from cents
        evidence: dispute.evidence ? JSON.stringify(dispute.evidence) : null
      }
    })

    // Notify both parties
    await createNotification(
      payment.project.clientId,
      "Payment Dispute Created ⚠️",
      `A dispute has been created for your payment of $${payment.amount} for "${payment.project.title}". Please check your email for details from Stripe.`,
      "dispute_created"
    )

    await createNotification(
      payment.project.freelancerId,
      "Payment Dispute Alert ⚠️",
      `A payment dispute has been created for project "${payment.project.title}". The payment of $${payment.amount} is now under review.`,
      "dispute_created"
    )

    console.log("✅ Dispute notifications sent")
  } catch (error) {
    console.error("❌ Error handling dispute creation:", error)
  }
}
