import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Redirect authenticated users from auth pages to dashboard
    if (req.nextUrl.pathname.startsWith("/auth/") && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages for unauthenticated users
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true
        }

        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"]
}
