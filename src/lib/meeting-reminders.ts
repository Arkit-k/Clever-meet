import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

// Email configuration (you'll need to set up your email service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface MeetingReminder {
  meetingId: string
  scheduledTime: Date
  reminderTime: Date
  sent: boolean
}

// Schedule a reminder for 1 hour before meeting
export async function scheduleMeetingReminder(meetingId: string, meetingTime: Date) {
  try {
    // Calculate reminder time (1 hour before meeting)
    const reminderTime = new Date(meetingTime.getTime() - 60 * 60 * 1000) // 1 hour before
    
    // Only schedule if reminder time is in the future
    if (reminderTime > new Date()) {
      console.log(`📅 Scheduling reminder for meeting ${meetingId}`)
      console.log(`Meeting time: ${meetingTime.toISOString()}`)
      console.log(`Reminder time: ${reminderTime.toISOString()}`)
      
      // Store reminder in database (you might want to create a MeetingReminder model)
      // For now, we'll use a simple approach with setTimeout for demo
      const timeUntilReminder = reminderTime.getTime() - Date.now()
      
      if (timeUntilReminder > 0) {
        setTimeout(async () => {
          await sendMeetingReminder(meetingId)
        }, timeUntilReminder)
        
        console.log(`⏰ Reminder scheduled for ${timeUntilReminder / 1000 / 60} minutes from now`)
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error("Error scheduling meeting reminder:", error)
    return false
  }
}

// Send meeting reminder notifications
export async function sendMeetingReminder(meetingId: string) {
  try {
    console.log(`🔔 Sending meeting reminder for ${meetingId}`)
    
    // Get meeting details
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
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

    if (!meeting) {
      console.error(`Meeting ${meetingId} not found`)
      return false
    }

    // Check if meeting is still scheduled (not cancelled)
    if (meeting.status === 'CANCELLED') {
      console.log(`Meeting ${meetingId} was cancelled, skipping reminder`)
      return false
    }

    const meetingTime = new Date(meeting.scheduledAt)
    const formattedTime = meetingTime.toLocaleString()
    
    // Create notifications in database
    await Promise.all([
      // Client notification
      prisma.notification.create({
        data: {
          userId: meeting.clientId,
          title: "🔔 Meeting Reminder - 1 Hour",
          message: `Your meeting with ${meeting.freelancer.name} starts in 1 hour at ${formattedTime}`,
          type: "meeting_reminder"
        }
      }),
      
      // Freelancer notification
      prisma.notification.create({
        data: {
          userId: meeting.freelancerId,
          title: "🔔 Meeting Reminder - 1 Hour", 
          message: `Your meeting with ${meeting.client.name} starts in 1 hour at ${formattedTime}`,
          type: "meeting_reminder"
        }
      })
    ])

    // Send email reminders
    await Promise.all([
      sendEmailReminder(
        meeting.client.email,
        meeting.client.name,
        meeting.freelancer.name,
        meetingTime,
        meeting.meetingUrl || `${process.env.NEXTAUTH_URL}/meeting/${meetingId}`,
        'client'
      ),
      
      sendEmailReminder(
        meeting.freelancer.email,
        meeting.freelancer.name,
        meeting.client.name,
        meetingTime,
        meeting.meetingUrl || `${process.env.NEXTAUTH_URL}/meeting/${meetingId}`,
        'freelancer'
      )
    ])

    console.log(`✅ Meeting reminders sent for ${meetingId}`)
    return true

  } catch (error) {
    console.error("Error sending meeting reminder:", error)
    return false
  }
}

// Send email reminder
async function sendEmailReminder(
  email: string,
  recipientName: string,
  otherPartyName: string,
  meetingTime: Date,
  meetingUrl: string,
  userType: 'client' | 'freelancer'
) {
  try {
    const subject = `🔔 Meeting Reminder - 1 Hour Until Your ClearAway Meeting`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .meeting-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Meeting Reminder</h1>
            <p>Your ClearAway meeting starts in 1 hour!</p>
          </div>
          
          <div class="content">
            <h2>Hi ${recipientName}!</h2>
            
            <p>This is a friendly reminder that your meeting is starting soon.</p>
            
            <div class="meeting-card">
              <h3>📅 Meeting Details</h3>
              <p><strong>With:</strong> ${otherPartyName}</p>
              <p><strong>Time:</strong> ${meetingTime.toLocaleString()}</p>
              <p><strong>Duration:</strong> 15 minutes</p>
              <p><strong>Type:</strong> ${userType === 'client' ? 'Client Discovery Call' : 'Freelancer Interview'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meetingUrl}" class="button">🎥 Meeting Link Available Now</a>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4>🔗 Meeting Link Access:</h4>
              <p>Your meeting link is now available! The link becomes accessible exactly 1 hour before your scheduled meeting time.</p>
              <p><strong>Meeting URL:</strong> <a href="${meetingUrl}" style="color: #3b82f6;">${meetingUrl}</a></p>
            </div>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4>💡 Meeting Tips:</h4>
              <ul>
                <li>Test your camera and microphone beforehand</li>
                <li>Have your questions ready</li>
                <li>Be in a quiet environment</li>
                <li>${userType === 'client' ? 'Prepare to discuss your project requirements' : 'Be ready to showcase your skills and experience'}</li>
              </ul>
            </div>
            
            <p>If you need to reschedule or have any issues, please contact us immediately.</p>
            
            <div class="footer">
              <p>Best regards,<br>The ClearAway Team</p>
              <p><small>This is an automated reminder. Please do not reply to this email.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"ClearAway" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html
    })

    console.log(`📧 Email reminder sent to ${email}`)
    return true

  } catch (error) {
    console.error(`Error sending email to ${email}:`, error)
    return false
  }
}

// Check for upcoming meetings and schedule reminders
export async function scheduleUpcomingReminders() {
  try {
    console.log("🔍 Checking for upcoming meetings to schedule reminders...")
    
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    // Find meetings scheduled for the next 24 hours that don't have reminders yet
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: tomorrow
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    console.log(`Found ${upcomingMeetings.length} upcoming meetings`)
    
    let scheduled = 0
    for (const meeting of upcomingMeetings) {
      const success = await scheduleMeetingReminder(meeting.id, meeting.scheduledAt)
      if (success) scheduled++
    }
    
    console.log(`✅ Scheduled reminders for ${scheduled} meetings`)
    return scheduled

  } catch (error) {
    console.error("Error scheduling upcoming reminders:", error)
    return 0
  }
}

// Initialize reminder system (call this when server starts)
export function initializeMeetingReminders() {
  console.log("🚀 Initializing meeting reminder system...")
  
  // Schedule reminders for existing upcoming meetings
  scheduleUpcomingReminders()
  
  // Set up periodic check every hour for new meetings
  setInterval(() => {
    scheduleUpcomingReminders()
  }, 60 * 60 * 1000) // Check every hour
  
  console.log("✅ Meeting reminder system initialized")
}
