import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoForLightBg } from "@/components/logo"
import { LogosCarousel } from "@/components/logos-carousel"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <LogoForLightBg size="md" />

            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-black text-white hover:bg-gray-800 rounded-full px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-white/30"></div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-8" style={{ fontFamily: 'Francy, serif' }}>
            <span className="text-gray-900 block mb-2">Great Collaborations</span>
            <span className="text-gray-900 block">Start with a </span>
            <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent font-bold">
              Call
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            MeetBoard connects clients and freelancers through seamless meetings, project boards, and built-in communication
            — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg rounded-full font-medium">
                Get started
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-full border-gray-300 hover:bg-gray-50 font-medium">
                Learn more
              </Button>
            </Link>
          </div>

          <div className="mt-16">
            <div className="text-sm text-gray-500 mb-8 text-center">
              Currently supported
            </div>
            <LogosCarousel />
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-400 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-50 animate-pulse delay-500"></div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Francy, serif' }}>
              How it works
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Main Flow Diagram */}
            <div className="relative bg-gray-100 rounded-3xl p-8 sm:p-12 mb-8">
              <div className="flex items-center justify-between">
                {/* Left Side - Process Flow */}
                <div className="relative flex-1">
                  <div className="flex items-center gap-8">
                    {/* Find Freelancer Card */}
                    <div className="bg-gray-800 text-white rounded-3xl p-8 text-center">
                      <h3 className="text-xl font-semibold whitespace-nowrap">Find freelancer</h3>
                    </div>

                    {/* Right side elements */}
                    <div className="flex flex-col gap-4">
                      {/* Book a call bubble */}
                      <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border flex items-center gap-2">
                        <span className="text-sm font-medium">
                          <span className="text-pink-500 font-bold">Book a </span>
                          <span className="text-blue-500 font-bold">call</span>
                        </span>
                      </div>

                      {/* Google Meet icon */}
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg self-start ml-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1z"/>
                          <path d="M19 6.5v11l4-4v-3l-4-4z"/>
                        </svg>
                      </div>

                      {/* Approve/Reject buttons */}
                      <div className="flex gap-3">
                        <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border flex items-center gap-2">
                          <span className="text-sm font-medium">Approve</span>
                          <span className="text-green-500 text-xl font-bold">✓</span>
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border flex items-center gap-2">
                          <span className="text-sm font-medium">Reject</span>
                          <span className="text-red-500 text-xl font-bold">✗</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center - Arrow */}
                <div className="flex justify-center px-8">
                  <div className="text-gray-400 text-4xl">→</div>
                </div>

                {/* Right Side - MeetBoard Interface */}
                <div className="flex justify-center flex-1">
                  <div className="bg-gray-200 rounded-2xl p-6 w-72">
                    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                      <h4 className="font-bold text-xl text-center text-gray-800">MeetBoard</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800 rounded-xl h-20 shadow-sm"></div>
                      <div className="bg-gray-800 rounded-xl h-20 shadow-sm"></div>
                      <div className="bg-gray-800 rounded-xl h-20 shadow-sm"></div>
                      <div className="bg-gray-800 rounded-xl h-20 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connect with Plugin */}
            <div className="text-center mt-8">
              <div className="inline-block bg-gray-100 rounded-full px-12 py-6 border-2 border-gray-300 shadow-lg">
                <span className="text-xl font-medium text-gray-800">connect with plugin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Clevermeet Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: 'Francy, serif' }}>
              Why to even use Clevermeet
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Comparison Table */}
            <div className="bg-gray-100 rounded-2xl p-8 text-gray-900">
              {/* Header Row */}
              <div className="grid grid-cols-3 gap-8 mb-8">
                <div></div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">Before MeetBoard</h3>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">With MeetBoard</h3>
                </div>
              </div>

              {/* Comparison Rows */}
              <div className="space-y-6">
                {/* Booking */}
                <div className="grid grid-cols-3 gap-8 items-center py-4 border-b border-gray-200">
                  <div className="font-semibold text-lg">Booking</div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span>Endless DMs, delays</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span>Instant 1-click scheduling</span>
                  </div>
                </div>

                {/* Communication */}
                <div className="grid grid-cols-3 gap-8 items-center py-4 border-b border-gray-200">
                  <div className="font-semibold text-lg">Communication</div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span>Scattered chats</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span>Centralized chat & meetings</span>
                  </div>
                </div>

                {/* Feedback */}
                <div className="grid grid-cols-3 gap-8 items-center py-4 border-b border-gray-200">
                  <div className="font-semibold text-lg">Feedback</div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span>Late, untracked</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span>Seamless feedback loop</span>
                  </div>
                </div>

                {/* Trust */}
                <div className="grid grid-cols-3 gap-8 items-center py-4">
                  <div className="font-semibold text-lg">Trust</div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span>Doubtful, unclear scope</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span>Preview profiles + portfolios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Excited About Clevermeet Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Francy, serif' }}>
              Excited About Clevermeet
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* CTA Card */}
            <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Start Better Collaborations Today
                </h3>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Try MeetBoard for free — no credit card required. It's the future of freelance meetings, built for doers.
                </p>

                {/* CTA Image */}
                <div className="relative mb-8">
                  <div className="bg-white rounded-2xl p-6 mx-auto max-w-3xl">
                    <img
                      src="/uploads/cta.jpeg"
                      alt="Diverse team of professionals collaborating"
                      className="w-full h-auto rounded-xl"
                    />
                  </div>

                  {/* Arrow button */}
                  <div className="absolute bottom-4 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-lg font-bold text-white">Cliverside</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The modern platform for freelancer-client collaboration. 
                Build your business with confidence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign in</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:hello@cliverside.com" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="mailto:support@cliverside.com" className="hover:text-white transition-colors">Help</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Cliverside. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
