"use client"

import { useEffect } from "react"

// Simple Cal.com booking button using direct link approach
interface CalBookingButtonProps {
  calLink: string
  buttonText?: string
  className?: string
  config?: {
    name?: string
    email?: string
    notes?: string
  }
}

export function CalBookingButton({
  calLink,
  buttonText = "Book a Meeting",
  className = "",
  config
}: CalBookingButtonProps) {
  const handleBooking = () => {
    // Clean the calLink to ensure it's properly formatted
    let cleanLink = calLink

    // If it's just a username, convert to full URL
    if (!cleanLink.startsWith('http')) {
      cleanLink = `https://cal.com/${cleanLink}`
    }

    // Add prefill parameters if config is provided
    const params = new URLSearchParams()
    if (config?.name) params.append('name', config.name)
    if (config?.email) params.append('email', config.email)
    if (config?.notes) params.append('notes', config.notes)

    const finalUrl = params.toString()
      ? `${cleanLink}?${params.toString()}`
      : cleanLink

    // Open in new window
    window.open(finalUrl, '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes')
  }

  return (
    <button
      onClick={handleBooking}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
    >
      {buttonText}
    </button>
  )
}

// Inline Cal.com embed using iframe
interface CalInlineEmbedProps {
  calLink: string
  height?: string
  config?: {
    theme?: "light" | "dark"
  }
}

export function CalInlineEmbed({
  calLink,
  height = "600px",
  config
}: CalInlineEmbedProps) {
  // Clean the calLink to ensure it's properly formatted
  let cleanLink = calLink

  // If it's just a username, convert to full URL
  if (!cleanLink.startsWith('http')) {
    cleanLink = `https://cal.com/${cleanLink}`
  }

  // Add embed parameter
  const embedUrl = `${cleanLink}?embed=true&theme=${config?.theme || 'light'}`

  return (
    <div style={{ height, width: '100%' }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 'none', borderRadius: '8px' }}
        title="Cal.com Booking"
      />
    </div>
  )
}

// Alternative: Simple link-based approach for MVP
interface CalLinkButtonProps {
  calLink: string
  buttonText?: string
  className?: string
  children?: React.ReactNode
}

export function CalLinkButton({
  calLink,
  buttonText = "Book a Meeting",
  className = "",
  children
}: CalLinkButtonProps) {
  // Clean the calLink to ensure it's properly formatted
  let cleanLink = calLink

  // If it's just a username, convert to full URL
  if (!cleanLink.startsWith('http')) {
    cleanLink = `https://cal.com/${cleanLink}`
  }

  return (
    <a
      href={cleanLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
    >
      {children || buttonText}
    </a>
  )
}
