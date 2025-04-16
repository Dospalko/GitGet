"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, BookIcon, GitForkIcon, StarIcon } from "lucide-react"
import { UserProfile } from "@/components/user-profile"
import { LanguageBreakdown } from "@/components/language-breakdown"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { TopRepositories } from "@/components/top-repositories"
import { WidgetGenerator } from "@/components/widget-generator"
import {
  fetchUser,
  fetchRepos,
  fetchEvents,
  processLanguageData,
  processEventsToContributions,
  type GitHubUser,
  type GitHubRepo,
  type GitHubEvent,
  type GitHubLanguage,
  type ContributionDay,
  type ActivitySummary,
} from "@/lib/github"

interface GitHubProfileVisualizerProps {
  username: string
}

export function GitHubProfileVisualizer({ username }: GitHubProfileVisualizerProps) {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [languages, setLanguages] = useState<GitHubLanguage[]>([])
  const [contributionData, setContributionData] = useState<ContributionDay[]>([])
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGitHubData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch user data
        const userData = await fetchUser(username)
        setUser(userData)

        // Fetch repositories
        const reposData = await fetchRepos(username)
        setRepos(reposData)

        // Process language data
        const languageData = await processLanguageData(reposData)
        setLanguages(languageData)

        // Fetch events for contribution data
        const eventsData = await fetchEvents(username)
        setEvents(eventsData)

        // Process events into contribution data
        const { contributionDays, activitySummary } = processEventsToContributions(eventsData)
        setContributionData(contributionDays)
        setActivitySummary(activitySummary)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching GitHub data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGitHubData()
  }, [username])

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {user && (
        <>
          <UserProfile user={user} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <StarIcon className="mr-2 h-5 w-5" />
                  <span>Stars</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}</p>
                <p className="text-muted-foreground text-sm">Total stars across all repositories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <BookIcon className="mr-2 h-5 w-5" />
                  <span>Repositories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{user.public_repos}</p>
                <p className="text-muted-foreground text-sm">Public repositories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <GitForkIcon className="mr-2 h-5 w-5" />
                  <span>Forks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{repos.reduce((sum, repo) => sum + repo.forks_count, 0)}</p>
                <p className="text-muted-foreground text-sm">Total forks across all repositories</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="languages">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="languages">Languages</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="repositories">Top Repositories</TabsTrigger>
              <TabsTrigger value="widgets">Widgets</TabsTrigger>
            </TabsList>

            <TabsContent value="languages" className="mt-6">
              <LanguageBreakdown languages={languages} repos={repos} />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <ActivityHeatmap
                username={username}
                contributionData={contributionData}
                activitySummary={activitySummary}
                repos={repos}
              />
            </TabsContent>

            <TabsContent value="repositories" className="mt-6">
              <TopRepositories repos={repos} />
            </TabsContent>

            <TabsContent value="widgets" className="mt-6">
              <WidgetGenerator user={user} repos={repos} languages={languages} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
