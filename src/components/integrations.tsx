"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Github, 
  Dribbble, 
  Figma, 
  ExternalLink, 
  Plus, 
  X, 
  Check,
  FileText,
  Folder,
  Palette
} from "lucide-react"
import Link from "next/link"

// Integration platform configurations
export const INTEGRATION_PLATFORMS = {
  github: {
    name: "GitHub",
    icon: Github,
    color: "bg-gray-900",
    description: "Showcase your code repositories",
    urlPattern: /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
    placeholder: "https://github.com/username"
  },
  dribbble: {
    name: "Dribbble",
    icon: Dribbble,
    color: "bg-pink-500",
    description: "Display your design shots",
    urlPattern: /^https:\/\/(www\.)?dribbble\.com\/[a-zA-Z0-9_-]+\/?$/,
    placeholder: "https://dribbble.com/username"
  },
  behance: {
    name: "Behance",
    icon: Palette,
    color: "bg-blue-600",
    description: "Show your creative portfolio",
    urlPattern: /^https:\/\/(www\.)?behance\.net\/[a-zA-Z0-9_-]+\/?$/,
    placeholder: "https://behance.net/username"
  },
  figma: {
    name: "Figma",
    icon: Figma,
    color: "bg-purple-500",
    description: "Share your design files",
    urlPattern: /^https:\/\/(www\.)?figma\.com\/@[a-zA-Z0-9_-]+\/?$/,
    placeholder: "https://figma.com/@username"
  },
  notion: {
    name: "Notion",
    icon: FileText,
    color: "bg-gray-800",
    description: "Link your public workspace",
    urlPattern: /^https:\/\/(www\.)?notion\.so\/[a-zA-Z0-9_-]+\/?.*$/,
    placeholder: "https://notion.so/username"
  },
  googledrive: {
    name: "Google Drive",
    icon: Folder,
    color: "bg-blue-500",
    description: "Share your drive folder",
    urlPattern: /^https:\/\/drive\.google\.com\/.*$/,
    placeholder: "https://drive.google.com/drive/folders/..."
  }
}

export interface Integration {
  id?: string
  platform: keyof typeof INTEGRATION_PLATFORMS
  url: string
  title?: string
  isPublic: boolean
  createdAt?: string
}

interface IntegrationsProps {
  integrations: Integration[]
  onUpdate: (integrations: Integration[]) => void
  isEditing?: boolean
}

export function Integrations({ integrations, onUpdate, isEditing = false }: IntegrationsProps) {
  const [newIntegration, setNewIntegration] = useState<Partial<Integration>>({
    platform: 'github',
    url: '',
    title: '',
    isPublic: true
  })
  const [isAdding, setIsAdding] = useState(false)

  const validateUrl = (platform: keyof typeof INTEGRATION_PLATFORMS, url: string): boolean => {
    const config = INTEGRATION_PLATFORMS[platform]
    return config.urlPattern.test(url)
  }

  const addIntegration = () => {
    if (!newIntegration.platform || !newIntegration.url) return
    
    if (!validateUrl(newIntegration.platform, newIntegration.url)) {
      alert(`Please enter a valid ${INTEGRATION_PLATFORMS[newIntegration.platform].name} URL`)
      return
    }

    const integration: Integration = {
      id: Date.now().toString(),
      platform: newIntegration.platform,
      url: newIntegration.url,
      title: newIntegration.title || INTEGRATION_PLATFORMS[newIntegration.platform].name,
      isPublic: newIntegration.isPublic || true,
      createdAt: new Date().toISOString()
    }

    onUpdate([...integrations, integration])
    setNewIntegration({
      platform: 'github',
      url: '',
      title: '',
      isPublic: true
    })
    setIsAdding(false)
  }

  const removeIntegration = (id: string) => {
    onUpdate(integrations.filter(integration => integration.id !== id))
  }

  const updateIntegration = (id: string, updates: Partial<Integration>) => {
    onUpdate(integrations.map(integration => 
      integration.id === id ? { ...integration, ...updates } : integration
    ))
  }

  if (!isEditing && integrations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Platform Integrations
        </CardTitle>
        <CardDescription>
          Connect your professional platforms to showcase your work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Integrations */}
        <div className="grid gap-3">
          {integrations.map((integration) => {
            const config = INTEGRATION_PLATFORMS[integration.platform]
            const Icon = config.icon
            
            return (
              <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{integration.title}</p>
                    <p className="text-xs text-muted-foreground">{config.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={integration.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeIntegration(integration.id!)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add New Integration */}
        {isEditing && (
          <div className="space-y-4">
            {!isAdding ? (
              <Button 
                variant="outline" 
                onClick={() => setIsAdding(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Platform Integration
              </Button>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <select
                      id="platform"
                      value={newIntegration.platform}
                      onChange={(e) => setNewIntegration(prev => ({ 
                        ...prev, 
                        platform: e.target.value as keyof typeof INTEGRATION_PLATFORMS 
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {Object.entries(INTEGRATION_PLATFORMS).map(([key, config]) => (
                        <option key={key} value={key}>{config.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="title">Custom Title (Optional)</Label>
                    <Input
                      id="title"
                      value={newIntegration.title}
                      onChange={(e) => setNewIntegration(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="My Portfolio"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newIntegration.url}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, url: e.target.value }))}
                    placeholder={INTEGRATION_PLATFORMS[newIntegration.platform!].placeholder}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addIntegration} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAdding(false)} 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Platform Grid for Quick Access */}
        {!isEditing && integrations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {integrations.map((integration) => {
              const config = INTEGRATION_PLATFORMS[integration.platform]
              const Icon = config.icon
              
              return (
                <Link 
                  key={integration.id}
                  href={integration.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={`w-6 h-6 rounded ${config.color} flex items-center justify-center`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium truncate">{integration.title}</span>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
