import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(amount, description || `Payment for ${project.title}`)

    if (!paypalOrder.id) {
      throw new Error('Failed to create PayPal order')
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        projectId: project.id,
        milestoneId: milestoneId || null,
        meetingId: null,
        payerId: session.user.id,
        recipientId: project.freelancerId,
        amount: amount,
        currency: 'USD',
        status: 'PENDING',
        paymentMethod: 'PAYPAL',
        paypalOrderId: paypalOrder.id,
        description: description || `Payment for ${project.title}`
      }
    })

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.id,
      paymentId: payment.id,
      amount: amount,
      currency: 'USD'
    })

  } catch (error) {
    console.error('PayPal order creation error:', error)
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    )
  }
}

async function createPayPalOrder(amount: number, description: string) {
  const accessToken = await getPayPalAccessToken()
  
  const response = await fetch(`${getPayPalBaseURL()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          },
          description: description
        }
      ],
      application_context: {
        return_url: `${process.env.NEXTAUTH_URL}/api/payments/paypal/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/api/payments/paypal/cancel`,
        brand_name: 'Freelance MeetBoard',
        user_action: 'PAY_NOW'
      }
    })
  })

  return await response.json()
}

async function getPayPalAccessToken() {
  const response = await fetch(`${getPayPalBaseURL()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()
  return data.access_token
}

function getPayPalBaseURL() {
  return process.env.PAYPAL_MODE === 'live' 
    ? 'https://api.paypal.com' 
    : 'https://api.sandbox.paypal.com'
}
