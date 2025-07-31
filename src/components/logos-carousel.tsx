"use client"

import Image from "next/image"

const logos = [
  { name: "Google Meet", src: "/logos/google-meet.png" },
  { name: "Zoom", src: "/logos/zoom.png" },
  { name: "Figma", src: "/logos/figma.png" },
  { name: "Notion", src: "/logos/notion.png" },
  { name: "Illustrator", src: "/logos/illustrator.png" },
  { name: "GitHub", src: "/logos/github.png" },
  { name: "Linear", src: "/logos/linear.png" },
  { name: "Canva", src: "/logos/canva.png" },
  { name: "Atlassian", src: "/logos/atlsian.png" },
]

export function LogosCarousel() {
  // Create enough duplicates for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos]

  return (
    <div className="w-full max-w-6xl mx-auto overflow-hidden">
      <div className="relative py-8">
        <div className="flex animate-scroll-left space-x-12 whitespace-nowrap">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 relative opacity-60 hover:opacity-100 transition-opacity duration-300 group"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                fill
                className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                sizes="(max-width: 640px) 48px, 64px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Alternative static version without animation
export function LogosGrid() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-8 py-8">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="w-12 h-12 sm:w-16 sm:h-16 relative opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            <Image
              src={logo.src}
              alt={logo.name}
              fill
              className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
              sizes="(max-width: 640px) 48px, 64px"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
