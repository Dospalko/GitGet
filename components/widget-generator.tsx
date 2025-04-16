import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPicker } from "@/components/ui/color-picker"
import type { GitHubUser, GitHubRepo, GitHubLanguage } from "@/lib/github"

interface WidgetGeneratorProps {
  user: GitHubUser
  repos: GitHubRepo[]
  languages: GitHubLanguage[]
}

export function WidgetGenerator({ user, repos, languages }: WidgetGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState("light")
  const [primaryColor, setPrimaryColor] = useState("#2563eb")
  const [selectedWidget, setSelectedWidget] = useState("profile")
  const [embedCode, setEmbedCode] = useState("")

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin
    const widgetUrl = `${baseUrl}/api/widgets/${selectedWidget}?username=${user.login}&theme=${selectedTheme}&color=${encodeURIComponent(primaryColor)}`
    
    const code = `<iframe
  src="${widgetUrl}"
  width="100%"
  height="200"
  frameborder="0"
  scrolling="no"
></iframe>`
    
    setEmbedCode(code)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widget Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="profile" onValueChange={setSelectedWidget}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Card</TabsTrigger>
            <TabsTrigger value="repos">Repository Card</TabsTrigger>
            <TabsTrigger value="stats">Stats Card</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <WidgetPreview type="profile" user={user} theme={selectedTheme} primaryColor={primaryColor} />
          </TabsContent>

          <TabsContent value="repos" className="space-y-4">
            <Select onValueChange={(repo) => console.log(repo)}>
              <SelectTrigger>
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
            <WidgetPreview type="repos" repo={repos[0]} theme={selectedTheme} primaryColor={primaryColor} />
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
        </Tabs>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Select defaultValue={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>

            <ColorPicker 
              color={primaryColor} 
              onChange={setPrimaryColor} 
              label="Accent Color" 
            />
          </div>

          <Button onClick={generateEmbedCode} className="w-full">
            Generate Embed Code
          </Button>

          {embedCode && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Copy this code to embed the widget:</p>
              <div className="relative">
                <Input 
                  value={embedCode} 
                  readOnly 
                  className="pr-20 font-mono text-sm"
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute right-1 top-1"
                  onClick={() => navigator.clipboard.writeText(embedCode)}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}