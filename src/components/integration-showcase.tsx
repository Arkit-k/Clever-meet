"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Github, 
  Dribbble, 
  Figma, 
  ExternalLink, 
  FileText,
  Folder,
  Palette,
  Eye
} from "lucide-react"
import Link from "next/link"
import { INTEGRATION_PLATFORMS, Integration } from "@/components/integrations"

interface IntegrationShowcaseProps {
  integrations: Integration[]
  freelancerName?: string
  className?: string
}

export function IntegrationShowcase({ 
  integrations, 
  freelancerName = "this freelancer",
  className 
}: IntegrationShowcaseProps) {
  if (!integrations || integrations.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Portfolio & Work Samples
        </CardTitle>
        <CardDescription>
          Explore {freelancerName}'s work across different platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Featured Integrations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {integrations.map((integration) => {
              const config = INTEGRATION_PLATFORMS[integration.platform]
              const Icon = config.icon
              
              return (
                <Link 
                  key={integration.id}
                  href={integration.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50 bg-gradient-to-br from-background to-muted/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                        {integration.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {config.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {config.name}
                      </Badge>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Quick Access Bar */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">Quick Access</h4>
              <Badge variant="outline" className="text-xs">
                {integrations.length} platform{integrations.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {integrations.map((integration) => {
                const config = INTEGRATION_PLATFORMS[integration.platform]
                const Icon = config.icon
                
                return (
                  <Link 
                    key={`quick-${integration.id}`}
                    href={integration.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-3 text-xs hover:bg-primary hover:text-primary-foreground"
                    >
                      <Icon className="h-3 w-3 mr-1.5" />
                      {config.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">
                  {integrations.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Platform{integrations.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-primary">
                  {integrations.filter(i => ['github', 'dribbble', 'behance'].includes(i.platform)).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Portfolio Sites
                </div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-primary">
                  {integrations.filter(i => ['figma', 'notion'].includes(i.platform)).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Work Tools
                </div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-primary">
                  {integrations.filter(i => i.platform === 'googledrive').length}
                </div>
                <div className="text-xs text-muted-foreground">
                  File Storage
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Click any platform above to view {freelancerName}'s work samples and portfolio
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for cards/lists
export function IntegrationBadges({ 
  integrations, 
  maxShow = 4,
  className 
}: { 
  integrations: Integration[]
  maxShow?: number
  className?: string 
}) {
  if (!integrations || integrations.length === 0) {
    return null
  }

  const visibleIntegrations = integrations.slice(0, maxShow)
  const remainingCount = integrations.length - maxShow

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {visibleIntegrations.map((integration) => {
        const config = INTEGRATION_PLATFORMS[integration.platform]
        const Icon = config.icon
        
        return (
          <Link 
            key={integration.id}
            href={integration.url} 
            target="_blank" 
            rel="noopener noreferrer"
            title={`View on ${config.name}`}
          >
            <div className={`w-6 h-6 rounded ${config.color} flex items-center justify-center hover:scale-110 transition-transform`}>
              <Icon className="h-3 w-3 text-white" />
            </div>
          </Link>
        )
      })}
      
      {remainingCount > 0 && (
        <Badge variant="secondary" className="text-xs h-6 px-2">
          +{remainingCount}
        </Badge>
      )}
    </div>
  )
}
