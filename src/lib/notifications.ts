import { prisma } from "./prisma"
import { sendEmail, createMeetingRequestEmail, createMeetingConfirmedEmail } from "./email"

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false
      }
    })
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

export async function notifyMeetingRequest(
  meetingId: string,
  clientId: string,
  freelancerId: string
) {
  try {
    console.log(`🔔 Creating notification for meeting ${meetingId} from client ${clientId} to freelancer ${freelancerId}`)

    // Get meeting and user details
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        client: { select: { name: true, email: true } },
        freelancer: { select: { name: true, email: true } }
      }
    })

    if (!meeting) {
      console.log(`❌ Meeting ${meetingId} not found`)
      return
    }

    console.log(`📧 Meeting found: ${meeting.title} - Client: ${meeting.client.name}, Freelancer: ${meeting.freelancer.name}`)

    // Create in-app notification
    const notification = await createNotification(
      freelancerId,
      "New Meeting Request",
      `${meeting.client.name} has requested a meeting: "${meeting.title}"`,
      "meeting_request"
    )

    console.log(`📱 In-app notification created:`, notification?.id)

    // Send email notification
    const emailContent = createMeetingRequestEmail(
      meeting.freelancer.name || "Freelancer",
      meeting.client.name || "Client",
      meeting.title,
      new Date(meeting.scheduledAt).toLocaleString(),
      meeting.description || undefined
    )

    await sendEmail({
      to: meeting.freelancer.email || "",
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })

    console.log(`✅ Meeting request notification sent to ${meeting.freelancer.name}`)
  } catch (error) {
    console.error("❌ Error sending meeting request notification:", error)
  }
}

export async function notifyMeetingConfirmed(
  meetingId: string,
  clientId: string,
  freelancerId: string
) {
  try {
    // Get meeting and user details
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        client: { select: { name: true, email: true } },
        freelancer: { select: { name: true, email: true } }
      }
    })

    if (!meeting) return

    // Create in-app notification for client
    await createNotification(
      clientId,
      "Meeting Confirmed",
      `${meeting.freelancer.name} has confirmed your meeting: "${meeting.title}"`,
      "meeting_confirmed"
    )

    // Send email notification to client
    const emailContent = createMeetingConfirmedEmail(
      meeting.client.name || "Client",
      meeting.freelancer.name || "Freelancer",
      meeting.title,
      new Date(meeting.scheduledAt).toLocaleString()
    )

    await sendEmail({
      to: meeting.client.email || "",
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })

    console.log(`✅ Meeting confirmation notification sent to ${meeting.client.name}`)
  } catch (error) {
    console.error("Error sending meeting confirmation notification:", error)
  }
}

export async function notifyMeetingCancelled(
  meetingId: string,
  notifyUserId: string,
  cancelledByName: string
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    })

    if (!meeting) return

    await createNotification(
      notifyUserId,
      "Meeting Cancelled",
      `${cancelledByName} has cancelled the meeting: "${meeting.title}"`,
      "meeting_cancelled"
    )

    console.log(`✅ Meeting cancellation notification sent`)
  } catch (error) {
    console.error("Error sending meeting cancellation notification:", error)
  }
}

export async function notifyPaymentReceived(
  freelancerId: string,
  amount: number,
  clientName: string,
  meetingTitle: string
) {
  try {
    await createNotification(
      freelancerId,
      "Payment Received",
      `You received $${amount.toFixed(2)} from ${clientName} for "${meetingTitle}"`,
      "payment"
    )

    console.log(`✅ Payment notification sent to freelancer`)
  } catch (error) {
    console.error("Error sending payment notification:", error)
  }
}

export async function notifyNewReview(
  freelancerId: string,
  rating: number,
  clientName: string,
  meetingTitle: string
) {
  try {
    await createNotification(
      freelancerId,
      "New Review Received",
      `${clientName} left you a ${rating}-star review for "${meetingTitle}"`,
      "review"
    )

    console.log(`✅ Review notification sent to freelancer`)
  } catch (error) {
    console.error("Error sending review notification:", error)
  }
}
