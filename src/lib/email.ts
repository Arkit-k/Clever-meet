// Email service for sending notifications
// In production, integrate with services like SendGrid, Mailgun, or AWS SES

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(data: EmailData) {
  // For MVP, we'll log the email instead of actually sending
  // In production, replace this with actual email service
  
  console.log('📧 Email would be sent:')
  console.log('To:', data.to)
  console.log('Subject:', data.subject)
  console.log('Content:', data.text || data.html)
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return { success: true, messageId: `mock-${Date.now()}` }
}

export function createMeetingRequestEmail(
  freelancerName: string,
  clientName: string,
  meetingTitle: string,
  meetingDate: string,
  meetingDescription?: string
) {
  const subject = `New Meeting Request: ${meetingTitle}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Meeting Request</h2>
      
      <p>Hi ${freelancerName},</p>
      
      <p>You have received a new meeting request from <strong>${clientName}</strong>.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${meetingTitle}</h3>
        <p><strong>Requested Date:</strong> ${meetingDate}</p>
        ${meetingDescription ? `<p><strong>Description:</strong> ${meetingDescription}</p>` : ''}
        <p><strong>Client:</strong> ${clientName}</p>
      </div>
      
      <p>Please log in to your dashboard to approve or decline this meeting request.</p>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/meetings" 
           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Meeting Request
        </a>
      </div>
      
      <p>Best regards,<br>Cliverside Team</p>
    </div>
  `
  
  const text = `
    New Meeting Request
    
    Hi ${freelancerName},
    
    You have received a new meeting request from ${clientName}.
    
    Meeting: ${meetingTitle}
    Date: ${meetingDate}
    ${meetingDescription ? `Description: ${meetingDescription}` : ''}
    
    Please log in to your dashboard to approve or decline this meeting request.
    
    Visit: ${process.env.NEXTAUTH_URL}/dashboard/meetings
    
    Best regards,
    Cliverside Team
  `
  
  return { subject, html, text }
}

export function createMeetingConfirmedEmail(
  clientName: string,
  freelancerName: string,
  meetingTitle: string,
  meetingDate: string
) {
  const subject = `Meeting Confirmed: ${meetingTitle}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Meeting Confirmed! 🎉</h2>
      
      <p>Hi ${clientName},</p>
      
      <p>Great news! <strong>${freelancerName}</strong> has confirmed your meeting request.</p>
      
      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="margin-top: 0; color: #28a745;">${meetingTitle}</h3>
        <p><strong>Date:</strong> ${meetingDate}</p>
        <p><strong>Freelancer:</strong> ${freelancerName}</p>
      </div>
      
      <p>You can now access the meeting board to communicate with your freelancer.</p>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/meetings" 
           style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Meeting Board
        </a>
      </div>
      
      <p>Best regards,<br>Cliverside Team</p>
    </div>
  `
  
  const text = `
    Meeting Confirmed!
    
    Hi ${clientName},
    
    Great news! ${freelancerName} has confirmed your meeting request.
    
    Meeting: ${meetingTitle}
    Date: ${meetingDate}
    
    You can now access the meeting board to communicate with your freelancer.
    
    Visit: ${process.env.NEXTAUTH_URL}/dashboard/meetings
    
    Best regards,
    Cliverside Team
  `
  
  return { subject, html, text }
}
