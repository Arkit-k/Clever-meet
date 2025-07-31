"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "dark" | "light" | "gradient"
  showText?: boolean
  className?: string
}

export function Logo({ 
  size = "md", 
  variant = "dark", 
  showText = true, 
  className 
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "w-6 h-6",
      text: "text-sm",
      logoText: "text-xs"
    },
    md: {
      container: "w-8 h-8 sm:w-10 sm:h-10",
      text: "text-lg sm:text-2xl",
      logoText: "text-sm sm:text-lg"
    },
    lg: {
      container: "w-12 h-12",
      text: "text-2xl",
      logoText: "text-lg"
    },
    xl: {
      container: "w-16 h-16",
      text: "text-3xl",
      logoText: "text-xl"
    }
  }

  const variantClasses = {
    dark: {
      container: "bg-gradient-to-br from-gray-800 to-gray-900",
      text: "text-white",
      brandText: "text-[#101010]"
    },
    light: {
      container: "bg-gradient-to-br from-gray-200 to-gray-300",
      text: "text-gray-800",
      brandText: "text-white"
    },
    gradient: {
      container: "bg-gradient-to-br from-blue-600 to-purple-600",
      text: "text-white",
      brandText: "text-[#101010]"
    }
  }

  const sizes = sizeClasses[size]
  const variants = variantClasses[variant]

  return (
    <div className={cn("flex items-center space-x-2 sm:space-x-3", className)}>
      <div className={cn(
        sizes.container,
        variants.container,
        "rounded-xl flex items-center justify-center shadow-sm"
      )}>
        <span className={cn(
          "font-bold",
          sizes.logoText,
          variants.text
        )}>
          M
        </span>
      </div>
      {showText && (
        <span className={cn(
          "font-bold",
          sizes.text,
          variants.brandText
        )}>
          MeetBoard
        </span>
      )}
    </div>
  )
}

// Specialized logo variants for common use cases
export function LogoIcon({ size = "md", variant = "dark", className }: Omit<LogoProps, "showText">) {
  return <Logo size={size} variant={variant} showText={false} className={className} />
}

export function LogoWithText({ size = "md", variant = "dark", className }: Omit<LogoProps, "showText">) {
  return <Logo size={size} variant={variant} showText={true} className={className} />
}

// Logo for different backgrounds
export function LogoForDarkBg({ size = "md", className }: { size?: LogoProps["size"], className?: string }) {
  return <Logo size={size} variant="light" showText={true} className={className} />
}

export function LogoForLightBg({ size = "md", className }: { size?: LogoProps["size"], className?: string }) {
  return <Logo size={size} variant="dark" showText={true} className={className} />
}
