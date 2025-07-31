import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const calButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101010] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary - Dark obsidian button (like "Play the Video", "Daily")
        primary:
          "bg-[#101010] text-[#FDFCF8] hover:bg-[#2A2A2A] shadow-sm rounded-full",

        // Secondary - Light button with border (like "Cancel")
        secondary:
          "bg-[#FDFCF8] text-[#101010] border border-[#101010] hover:bg-[#F3F0E9] rounded-full",

        // Ghost - Subtle button (like "Submit")
        ghost:
          "bg-[#E3DBCC] text-[#101010] hover:bg-[#D0C7B8] rounded-full",

        // Outline - Clean outline button
        outline:
          "border border-[#E3DBCC] bg-transparent text-[#101010] hover:bg-[#F3F0E9] rounded-full",

        // Link - Text button (like "See Pricing", "Read More")
        link:
          "text-[#101010] underline-offset-4 hover:underline font-medium bg-transparent",

        // Icon - Circular icon button (like play button, numbers)
        icon:
          "bg-[#101010] text-[#FDFCF8] hover:bg-[#2A2A2A] rounded-full w-12 h-12 p-0",

        // Tab - Tab-style button (like "Weekly", "Monthly")
        tab:
          "bg-transparent text-[#101010] hover:bg-[#F3F0E9] rounded-full border-0",

        // Success
        success:
          "bg-[#22C55E] text-[#FDFCF8] hover:bg-[#16A34A] shadow-sm rounded-full",

        // Danger
        danger:
          "bg-[#DC2626] text-[#FDFCF8] hover:bg-[#B91C1C] shadow-sm rounded-full",
      },
      size: {
        // Standard sizes with proper padding
        sm: "h-8 px-4 text-sm",
        default: "h-10 px-6 text-sm",
        lg: "h-12 px-8 text-base",

        // Icon sizes (circular)
        "icon-sm": "h-8 w-8 p-0",
        "icon-default": "h-10 w-10 p-0",
        "icon-lg": "h-12 w-12 p-0",

        // Special sizes for specific use cases
        "tab": "h-10 px-4 text-sm",
        "link": "h-auto p-0 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface CalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof calButtonVariants> {
  asChild?: boolean
}

// Export variant types for better TypeScript support
export type CalButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "link"
  | "icon"
  | "tab"
  | "success"
  | "danger"

export type CalButtonSize =
  | "sm"
  | "default"
  | "lg"
  | "icon-sm"
  | "icon-default"
  | "icon-lg"
  | "tab"
  | "link"

const CalButton = React.forwardRef<HTMLButtonElement, CalButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(calButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
CalButton.displayName = "CalButton"

export { CalButton, calButtonVariants }
