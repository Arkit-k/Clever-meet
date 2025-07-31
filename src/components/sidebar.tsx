"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  User,
  Calendar,
  Users,
  MessageSquare,
  Star,
  CreditCard,
  History,
  Settings,
  Bell,
  BarChart3,
  Clock,
  Menu,
  X,
  Home,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Shield
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session) {
      fetchUnreadCount()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        const unread = data.notifications?.filter((n: any) => !n.isRead).length || 0
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }

  if (!session) return null

  const isFreelancer = session.user.role === "FREELANCER"
  const isClient = session.user.role === "CLIENT"

  const freelancerNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: Home,
      badge: null
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
      badge: null
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: FolderOpen,
      badge: null,
      description: "Your project meetboards"
    },
    {
      title: "Meetings",
      href: "/dashboard/meetings",
      icon: Calendar,
      badge: null
    },
    {
      title: "Verification",
      href: "/dashboard/verification",
      icon: Shield,
      badge: null
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      badge: null
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
      badge: null
    },
    {
      title: "Reviews",
      href: "/dashboard/reviews",
      icon: Star,
      badge: null
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      badge: null
    }
  ]

  const clientNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: Home,
      badge: null
    },
    {
      title: "Find Freelancers",
      href: "/dashboard/freelancers",
      icon: Users,
      badge: null
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: FolderOpen,
      badge: null,
      description: "Your project meetboards"
    },
    {
      title: "My Meetings",
      href: "/dashboard/meetings",
      icon: Calendar,
      badge: null
    },
    {
      title: "Verification",
      href: "/dashboard/verification",
      icon: Shield,
      badge: null
    },
    {
      title: "History",
      href: "/dashboard/history",
      icon: History,
      badge: null
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
      badge: null
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      badge: null
    }
  ]

  const navItems = isFreelancer ? freelancerNavItems : clientNavItems

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className={cn("transition-all", isCollapsed && "hidden")}>
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              ClearAway
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b">
        <div className={cn("transition-all", isCollapsed && "hidden lg:block")}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className={cn("transition-all", isCollapsed && "lg:hidden")}>
              <p className="font-medium text-sm">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {isFreelancer ? "Freelancer" : "Client"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "lg:justify-center lg:px-2"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  <span className={cn("transition-all", isCollapsed && "lg:hidden")}>
                    {item.title}
                  </span>
                  {item.badge && !isCollapsed && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className={cn("text-xs text-muted-foreground", isCollapsed && "lg:hidden")}>
          <p>Freelance MeetBoard</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-background border-r transition-all duration-300",
          "lg:relative lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}

// Mobile-friendly sidebar toggle hook
export function useSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  return {
    isMobileOpen,
    setIsMobileOpen,
    toggleMobile: () => setIsMobileOpen(!isMobileOpen)
  }
}
