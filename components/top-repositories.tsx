import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitForkIcon, StarIcon, CodeIcon } from "lucide-react"
import type { GitHubRepo } from "@/lib/github"
import { useState, useEffect } from "react"

interface TopRepositoriesProps {
  repos: GitHubRepo[]
}

interface RepoLanguages {
  [key: string]: number
}

export function TopRepositories({ repos }: TopRepositoriesProps) {
  const [repoLanguages, setRepoLanguages] = useState<Map<number, string[]>>(new Map())

  useEffect(() => {
    // Fetch languages for each repository
    const fetchRepoLanguages = async () => {
      const languagesMap = new Map<number, string[]>()
      
      await Promise.all(
        repos.map(async (repo) => {
          try {
            const response = await fetch(repo.languages_url)
            const languages: RepoLanguages = await response.json()
            languagesMap.set(repo.id, Object.keys(languages))
          } catch (error) {
            console.error(`Error fetching languages for ${repo.full_name}:`, error)
          }
        })
      )
      
      setRepoLanguages(languagesMap)
    }

    fetchRepoLanguages()
  }, [repos])

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
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <StarIcon className="mr-1 h-3.5 w-3.5" />
                <span>{repo.stargazers_count}</span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <GitForkIcon className="mr-1 h-3.5 w-3.5" />
                <span>{repo.forks_count}</span>
              </div>
            </div>

            {/* Tech Stack Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CodeIcon className="h-3.5 w-3.5" />
                <span>Tech Stack</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {/* Show languages */}
                {repoLanguages.get(repo.id)?.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
                {/* Show topics if available */}
                {repo.topics?.map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
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
