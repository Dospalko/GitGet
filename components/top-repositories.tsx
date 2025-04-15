"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitForkIcon, StarIcon, CodeIcon, EyeIcon, AlertCircleIcon, CalendarIcon } from "lucide-react"
import type { GitHubRepo } from "@/lib/github"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

interface TopRepositoriesProps {
  repos: GitHubRepo[]
}

interface RepoLanguages {
  [key: string]: number
}

export function TopRepositories({ repos }: TopRepositoriesProps) {
  const [repoLanguages, setRepoLanguages] = useState<Map<number, string[]>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch languages for each repository
    const fetchRepoLanguages = async () => {
      setIsLoading(true)
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
        }),
      )

      setRepoLanguages(languagesMap)
      setIsLoading(false)
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Repository Stats</CardTitle>
            <CardDescription>Overview of repository metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Total Stars</span>
                <span className="text-2xl font-bold">
                  {repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Total Forks</span>
                <span className="text-2xl font-bold">{repos.reduce((sum, repo) => sum + repo.forks_count, 0)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Open Issues</span>
                <span className="text-2xl font-bold">
                  {repos.reduce((sum, repo) => sum + repo.open_issues_count, 0)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Watchers</span>
                <span className="text-2xl font-bold">{repos.reduce((sum, repo) => sum + repo.watchers_count, 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Repository Sizes</CardTitle>
            <CardDescription>Distribution of repository sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Small (&lt;1MB)</span>
                <span className="text-sm font-medium">{repos.filter((repo) => repo.size < 1000).length} repos</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full"
                  style={{ width: `${(repos.filter((repo) => repo.size < 1000).length / repos.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Medium (1-10MB)</span>
                <span className="text-sm font-medium">
                  {repos.filter((repo) => repo.size >= 1000 && repo.size < 10000).length} repos
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full"
                  style={{
                    width: `${(repos.filter((repo) => repo.size >= 1000 && repo.size < 10000).length / repos.length) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Large (&gt;10MB)</span>
                <span className="text-sm font-medium">{repos.filter((repo) => repo.size >= 10000).length} repos</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full"
                  style={{ width: `${(repos.filter((repo) => repo.size >= 10000).length / repos.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-semibold mb-4">Top Repositories</h3>

      <div className="space-y-4">
        {topRepos.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <CardDescription>{repo.description || "No description provided"}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>{formatDistanceToNow(new Date(repo.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-sm">
                    <StarIcon className="mr-1 h-4 w-4 text-amber-500" />
                    <span className="font-medium">{repo.stargazers_count}</span>
                    <span className="text-muted-foreground ml-1">stars</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <GitForkIcon className="mr-1 h-4 w-4 text-blue-500" />
                    <span className="font-medium">{repo.forks_count}</span>
                    <span className="text-muted-foreground ml-1">forks</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <EyeIcon className="mr-1 h-4 w-4 text-purple-500" />
                    <span className="font-medium">{repo.watchers_count}</span>
                    <span className="text-muted-foreground ml-1">watchers</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <AlertCircleIcon className="mr-1 h-4 w-4 text-red-500" />
                    <span className="font-medium">{repo.open_issues_count}</span>
                    <span className="text-muted-foreground ml-1">issues</span>
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
                    {isLoading ? (
                      <Badge variant="secondary" className="text-xs animate-pulse">
                        Loading languages...
                      </Badge>
                    ) : (
                      repoLanguages.get(repo.id)?.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))
                    )}
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
          </motion.div>
        ))}
      </div>
    </div>
  )
}
