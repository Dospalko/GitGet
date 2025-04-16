// src/components/widget-generator.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker"; // Correct import
import { WidgetPreview } from "@/components/widget-preview"; // Assuming this exists and is correct
import { Download, Image } from "lucide-react";
import type { GitHubUser, GitHubRepo, GitHubLanguage } from "@/lib/github"; // Ensure path is correct
import { toast } from "@/components/ui/use-toast"; // Ensure path is correct
import { Button } from "@/components/ui/button"; // Ensure path is correct

interface WidgetGeneratorProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  languages: GitHubLanguage[];
}

export function WidgetGenerator({ user, repos, languages }: WidgetGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [selectedWidget, setSelectedWidget] = useState("profile");
  const [selectedRepo, setSelectedRepo] = useState(repos && repos.length > 0 ? repos[0].name : "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const generateImage = async () => {
    setIsGenerating(true);
    setImageUrl("");
    console.log(`Generating image for widget: ${selectedWidget}, repo: ${selectedWidget === 'repo' ? selectedRepo : 'N/A'}`);
    try {
      const baseUrl = window.location.origin;
      let widgetUrl = `${baseUrl}/api/widgets/${selectedWidget}?username=${user.login}&theme=${selectedTheme}&color=${encodeURIComponent(primaryColor)}`;
      if (selectedWidget === 'repo' && selectedRepo) {
        widgetUrl += `&repo=${encodeURIComponent(selectedRepo)}`;
      }

      console.log('Fetching widget URL:', widgetUrl);
      const response = await fetch(widgetUrl);
      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorTitle = `Error Generating Image`;
        let errorDetails = `Failed with status: ${response.status}`;
         try {
            // Try to get specific error from API JSON response
            const errorData = await response.json();
            console.error('API Error Data:', errorData);
            errorDetails = errorData.details || errorData.error || errorDetails;
            if (errorData.error) errorTitle = errorData.error;
         } catch (e) {
            // Fallback if response is not JSON
            errorDetails = `Server returned status ${response.status}. Check server logs.`;
            console.error('Could not parse API error response as JSON.');
         }
        throw new Error(errorDetails); // Throw with detailed message
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
          console.error('Unexpected content type received:', contentType);
          throw new Error(`Expected an image response, but received ${contentType || 'unknown'}.`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      console.log('Image generated successfully:', url);

    } catch (error: any) {
      console.error('Error in generateImage function:', error);
      toast({
        title: "Error Generating Image", // Keep title generic or use specific from API if available
        description: error.message || "An unknown error occurred. Check console.", // Use detailed message
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!selectedRepo && repos && repos.length > 0) {
        setSelectedRepo(repos[0].name);
    }
  }, [repos, selectedRepo]);


  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    const repoPart = selectedWidget === 'repo' && selectedRepo ? `-${selectedRepo}` : '';
    link.download = `github-${selectedWidget}${repoPart}-widget.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentRepo = selectedWidget === 'repo' ? repos.find(r => r.name === selectedRepo) : undefined;

  return (
    <Card className="shadow-lg w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Widget Generator</CardTitle>
        <CardDescription>Customize and generate your GitHub widgets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Tabs defaultValue="profile" value={selectedWidget} onValueChange={setSelectedWidget} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-4 rounded-lg p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Profile</TabsTrigger>
            <TabsTrigger value="repo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Repository</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Stats</TabsTrigger>
          </TabsList>

          <div className="mt-6 rounded-lg border p-4 min-h-[230px] flex items-center justify-center bg-muted/30">
            {selectedWidget === 'profile' && <WidgetPreview type="profile" user={user} theme={selectedTheme} primaryColor={primaryColor} />}
            {/* Ensure WidgetPreview type prop matches 'repo' */}
            {selectedWidget === 'repo' && <WidgetPreview type="repo" repo={currentRepo} theme={selectedTheme} primaryColor={primaryColor} />}
            {selectedWidget === 'stats' && <WidgetPreview type="stats" languages={languages} theme={selectedTheme} primaryColor={primaryColor} user={user}/>}
          </div>
        </Tabs>

        {/* Controls Section */}
        <div className="space-y-6">
          {selectedWidget === 'repo' && (
            <div className="space-y-2">
                <label className="text-sm font-medium">Repository</label>
                <Select value={selectedRepo} onValueChange={setSelectedRepo} disabled={repos.length === 0}>
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder={repos.length > 0 ? "Select repository" : "No repositories found"} />
                    </SelectTrigger>
                    <SelectContent>
                    {repos.map((repo) => ( <SelectItem key={repo.id} value={repo.name}>{repo.name}</SelectItem> ))}
                    </SelectContent>
                </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <Select defaultValue={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                 <ColorPicker color={primaryColor} onChange={setPrimaryColor} label="Accent Color" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={generateImage} className="flex-1"
              disabled={isGenerating || (selectedWidget === 'repo' && !selectedRepo && repos.length > 0)}
            >
              <Image className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
            {imageUrl && (
              <Button onClick={downloadImage} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" /> Download PNG
              </Button>
            )}
          </div>

          {imageUrl && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="text-sm font-medium">Generated Image:</div>
              <img
                src={imageUrl} alt="Generated widget preview"
                className="w-full rounded-md border aspect-[3/1]"
                style={{backgroundColor: selectedTheme === 'dark' ? '#1a1b1e' : '#ffffff'}}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}