import React from 'react'
import { CalButton } from './cal-button'
import { Play, ArrowRight, Calendar, Users, Settings } from 'lucide-react'

export function ButtonShowcase() {
  return (
    <div className="p-8 bg-[#FDFCF8] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#101010] mb-2">Button Design System</h1>
          <p className="text-[#101010]/70">Consistent, beautiful buttons matching our neutral palette</p>
        </div>

        {/* Primary Actions */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#101010]">Primary Actions</h2>
          <div className="flex flex-wrap gap-4">
            <CalButton variant="primary" size="default">
              <Play className="w-4 h-4 mr-2" />
              Play the Video
            </CalButton>
            <CalButton variant="primary" size="lg">
              Schedule Meeting
            </CalButton>
            <CalButton variant="primary" size="sm">
              Save Changes
            </CalButton>
          </div>
        </section>

        {/* Secondary Actions */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#101010]">Secondary Actions</h2>
          <div className="flex flex-wrap gap-4">
            <CalButton variant="secondary" size="default">
              Cancel
            </CalButton>
            <CalButton variant="secondary" size="lg">
              Go Back
            </CalButton>
            <CalButton variant="outline" size="default">
              Learn More
            </CalButton>
          </div>
        </section>

        {/* Ghost & Subtle */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#101010]">Subtle Actions</h2>
          <div className="flex flex-wrap gap-4">
            <CalButton variant="ghost" size="default">
              Submit
            </CalButton>
            <CalButton variant="ghost" size="lg">
              Continue
            </CalButton>
            <CalButton variant="link" size="link">
              See Pricing
            </CalButton>
            <CalButton variant="link" size="link">
              Read More <ArrowRight className="w-4 h-4 ml-1" />
            </CalButton>
          </div>
        </section>

        {/* Icon Buttons */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#101010]">Icon Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <CalButton variant="icon" size="icon-default">
              <Play className="w-5 h-5" />
            </CalButton>
            <CalButton variant="icon" size="icon-lg">
              1
            </CalButton>
            <CalButton variant="icon" size="icon-default">
              2
            </CalButton>
            <CalButton variant="icon" size="icon-default">
              3
            </CalButton>
            <CalButton variant="icon" size="icon-default">
              <ArrowRight className="w-5 h-5" />
            </CalButton>
          </div>
        </section>

        {/* Tab Style */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#101010]">Tab Navigation</h2>
          <div className="flex gap-2 bg-[#F3F0E9] p-2 rounded-full w-fit">
            <CalButton variant="primary" size="tab">
              Daily
            </CalButton>
            <CalButton variant="tab" size="tab">
              Weekly
            </CalButton>
            <CalButton variant="tab" size="tab">
              Monthly
            </CalButton>
          </div>
        </section>

        {/* Status Buttons */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#101010]">Status Actions</h2>
          <div className="flex flex-wrap gap-4">
            <CalButton variant="success" size="default">
              <Calendar className="w-4 h-4 mr-2" />
              Confirm Meeting
            </CalButton>
            <CalButton variant="danger" size="default">
              Cancel Meeting
            </CalButton>
          </div>
        </section>

        {/* Button Groups */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#101010]">Button Groups</h2>
          
          {/* Action Group */}
          <div className="flex gap-3">
            <CalButton variant="primary" size="default">
              Save & Continue
            </CalButton>
            <CalButton variant="secondary" size="default">
              Save as Draft
            </CalButton>
            <CalButton variant="outline" size="default">
              Cancel
            </CalButton>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <CalButton variant="icon" size="icon-default">
              <ArrowRight className="w-4 h-4 rotate-180" />
            </CalButton>
            <CalButton variant="icon" size="icon-default">1</CalButton>
            <CalButton variant="icon" size="icon-default">2</CalButton>
            <CalButton variant="icon" size="icon-default">3</CalButton>
            <CalButton variant="icon" size="icon-default">
              <ArrowRight className="w-4 h-4" />
            </CalButton>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#101010]">Real-world Examples</h2>
          
          {/* Meeting Card Actions */}
          <div className="bg-[#F3F0E9] p-6 rounded-lg border border-[#E3DBCC]">
            <h3 className="font-semibold text-[#101010] mb-4">Client Meeting - John Doe</h3>
            <p className="text-[#101010]/70 mb-4">Tomorrow at 2:00 PM</p>
            <div className="flex gap-3">
              <CalButton variant="primary" size="default">
                <Calendar className="w-4 h-4 mr-2" />
                Join Meeting
              </CalButton>
              <CalButton variant="outline" size="default">
                Reschedule
              </CalButton>
              <CalButton variant="link" size="link">
                View Details
              </CalButton>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
