import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitForkIcon, StarIcon } from "lucide-react"
import type { GitHubRepo } from "@/lib/github"

interface TopRepositoriesProps {
  repos: GitHubRepo[]
}

export function TopRepositories({ repos }: TopRepositoriesProps) {
  // Sort by stars and take top 5
  const topRepos = [...repos]
    .filter((repo) => !repo.fork) // Filter out forks
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)

  if (topRepos.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No repositories found</div>
  }

  return (
    <div className="space-y-4">
      {topRepos.map((repo) => (
        <Card key={repo.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{repo.name}</CardTitle>
            <CardDescription>{repo.description || "No description provided"}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-wrap gap-2">
              {repo.language && <Badge variant="outline">{repo.language}</Badge>}

              <div className="flex items-center text-sm text-muted-foreground">
                <StarIcon className="mr-1 h-3.5 w-3.5" />
                <span>{repo.stargazers_count}</span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <GitForkIcon className="mr-1 h-3.5 w-3.5" />
                <span>{repo.forks_count}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                View Repository
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
