import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPicker } from "@/components/ui/color-picker"
import { WidgetPreview } from "@/components/widget-preview"
import { Download, Copy, Image } from "lucide-react"
import type { GitHubUser, GitHubRepo, GitHubLanguage } from "@/lib/github"
import { toast } from "@/components/ui/use-toast"

interface WidgetGeneratorProps {
  user: GitHubUser
  repos: GitHubRepo[]
  languages: GitHubLanguage[]
}

export function WidgetGenerator({ user, repos, languages }: WidgetGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState("light")
  const [primaryColor, setPrimaryColor] = useState("#2563eb")
  const [selectedWidget, setSelectedWidget] = useState("profile")
  const [selectedRepo, setSelectedRepo] = useState(repos[0]?.name || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  const generateImage = async () => {
    setIsGenerating(true)
    try {
      const baseUrl = window.location.origin
      const widgetUrl = `${baseUrl}/api/widgets/${selectedWidget}?username=${user.login}&theme=${selectedTheme}&color=${encodeURIComponent(primaryColor)}${selectedRepo ? `&repo=${selectedRepo}` : ''}`
      
      const response = await fetch(widgetUrl)
      if (!response.ok) {
        let errorMessage = 'Failed to generate image'
        try {
          const errorData = await response.json()
          errorMessage = errorData.details || errorData.error || errorMessage
        } catch {
          errorMessage = await response.text() || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setImageUrl(url)
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: "Error generating image",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async () => {
    if (!imageUrl) return
    
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `github-${selectedWidget}-widget.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Widget Generator</CardTitle>
        <CardDescription>Create beautiful widgets for your GitHub profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Tabs defaultValue="profile" onValueChange={setSelectedWidget} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-4 rounded-lg p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Profile Card
            </TabsTrigger>
            <TabsTrigger value="repos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Repository Card
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Stats Card
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 rounded-lg border p-4">
            <TabsContent value="profile" className="space-y-4">
              <WidgetPreview type="profile" user={user} theme={selectedTheme} primaryColor={primaryColor} />
            </TabsContent>

            <TabsContent value="repos" className="space-y-4">
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select repository" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.name}>
                      {repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <WidgetPreview 
                type="repos" 
                repo={repos.find(r => r.name === selectedRepo)} 
                theme={selectedTheme} 
                primaryColor={primaryColor} 
              />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <WidgetPreview 
                type="stats" 
                user={user} 
                languages={languages} 
                theme={selectedTheme} 
                primaryColor={primaryColor} 
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select defaultValue={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Theme</SelectItem>
                <SelectItem value="dark">Dark Theme</SelectItem>
                <SelectItem value="github">GitHub Theme</SelectItem>
                <SelectItem value="minimal">Minimal Theme</SelectItem>
              </SelectContent>
            </Select>

            <ColorPicker 
              color={primaryColor} 
              onChange={setPrimaryColor} 
              label="Accent Color" 
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={generateImage} 
              className="flex-1"
              disabled={isGenerating}
            >
              <Image className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>

            {imageUrl && (
              <Button 
                onClick={downloadImage} 
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
            )}
          </div>

          {imageUrl && (
            <div className="rounded-lg border p-4 space-y-4">
              <div className="text-sm font-medium">Preview:</div>
              <img 
                src={imageUrl} 
                alt="Generated widget" 
                className="w-full rounded-md border"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
