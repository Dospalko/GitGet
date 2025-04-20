import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="flex items-center space-x-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium animate-pulse">Fetching GitHub data...</p>
      </div>
      
      {/* Loading progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-8">
        {['Profile', 'Repositories', 'Activity'].map((item) => (
          <Card key={item} className="p-4">
            <div className="h-2 bg-primary/10 rounded-full w-3/4 animate-pulse" />
            <div className="space-y-2 mt-4">
              <div className="h-2 bg-muted rounded-full animate-pulse" />
              <div className="h-2 bg-muted rounded-full animate-pulse w-5/6" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}