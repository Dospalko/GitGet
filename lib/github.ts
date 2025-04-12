// GitHub API client

// Define types for GitHub API responses
export interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  html_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  company: string | null
  location: string | null
  blog: string | null
  twitter_username: string | null
  email: string | null
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  created_at: string
  topics: string[]
  fork: boolean
  size: number
  watchers_count: number
  open_issues_count: number
}

export interface GitHubEvent {
  id: string
  type: string
  created_at: string
  repo: {
    name: string
  }
  payload: any
}

export interface GitHubLanguage {
  name: string
  value: number
  color: string
  percentage: number
}

// Language colors mapping
export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Ruby: "#701516",
  PHP: "#4F5D95",
  CSS: "#563d7c",
  HTML: "#e34c26",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  Rust: "#dea584",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Vue: "#41b883",
  Jupyter: "#DA5B0B",
  Dockerfile: "#384d54",
  Makefile: "#427819",
}

// Default color for languages not in the map
const DEFAULT_COLOR = "#6e7681"

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchWithCache(url: string): Promise<any> {
  // Check cache first
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  // Fetch from API with error handling
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "GitHub-Profile-Visualizer",
      },
    })

    if (!response.ok) {
      if (response.status === 403 && response.headers.get("X-RateLimit-Remaining") === "0") {
        throw new Error("GitHub API rate limit exceeded. Please try again later.")
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()

    // Update cache
    cache.set(url, { data, timestamp: Date.now() })

    return data
  } catch (error) {
    console.error("Error fetching from GitHub API:", error)
    throw error
  }
}

// Fetch user profile data
export async function fetchUser(username: string): Promise<GitHubUser> {
  return fetchWithCache(`https://api.github.com/users/${username}`)
}

// Fetch user repositories
export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  // Fetch up to 100 repositories (GitHub API limit per page)
  return fetchWithCache(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
}

// Fetch user events (commits, PRs, issues)
export async function fetchEvents(username: string): Promise<GitHubEvent[]> {
  return fetchWithCache(`https://api.github.com/users/${username}/events?per_page=100`)
}

// Process language data from repositories
export async function processLanguageData(repos: GitHubRepo[]): Promise<GitHubLanguage[]> {
  // Count languages across all repositories
  const languageCounts: Record<string, number> = {}

  repos.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    }
  })

  // Calculate total and percentages
  const total = Object.values(languageCounts).reduce((sum, count) => sum + count, 0)

  // Convert to array and sort by count
  const languageData = Object.entries(languageCounts)
    .map(([name, value]) => ({
      name,
      value,
      color: LANGUAGE_COLORS[name] || DEFAULT_COLOR,
      percentage: (value / total) * 100,
    }))
    .sort((a, b) => b.value - a.value)

  return languageData
}

// Process events to generate contribution data
export function processEventsToContributions(events: GitHubEvent[]): {
  contributionDays: ContributionDay[]
  activitySummary: ActivitySummary
} {
  // Create a map to store contributions by date
  const contributionsByDate = new Map<string, ContributionDay>()

  // Initialize with the past 365 days
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split("T")[0]

    contributionsByDate.set(dateString, {
      date: dateString,
      count: 0,
      level: 0,
      details: {
        commits: 0,
        pullRequests: 0,
        issues: 0,
        reviews: 0,
      },
    })
  }

  // Process events to count contributions
  events.forEach((event) => {
    const date = new Date(event.created_at).toISOString().split("T")[0]
    const day = contributionsByDate.get(date)

    if (day) {
      // Increment the appropriate counter based on event type
      day.count++

      // Update the contribution level
      if (day.count <= 0) day.level = 0
      else if (day.count <= 2) day.level = 1
      else if (day.count <= 5) day.level = 2
      else if (day.count <= 10) day.level = 3
      else day.level = 4

      // Update details based on event type
      switch (event.type) {
        case "PushEvent":
          if (event.payload.commits) {
            day.details!.commits += event.payload.commits.length
          }
          break
        case "PullRequestEvent":
          day.details!.pullRequests++
          break
        case "IssuesEvent":
          day.details!.issues++
          break
        case "PullRequestReviewEvent":
          day.details!.reviews++
          break
      }
    }
  })

  // Convert map to array
  const contributionDays = Array.from(contributionsByDate.values())

  // Calculate activity summary
  const activitySummary = calculateActivitySummary(contributionDays)

  return { contributionDays, activitySummary }
}

// Calculate activity summary from contribution data
function calculateActivitySummary(contributionDays: ContributionDay[]): ActivitySummary {
  // Calculate total contributions
  const totalContributions = contributionDays.reduce((sum, day) => sum + day.count, 0)

  // Calculate streaks
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Sort days by date (most recent first)
  const sortedDays = [...contributionDays].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calculate current streak
  for (const day of sortedDays) {
    if (day.count > 0) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate longest streak
  for (const day of contributionDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())) {
    if (day.count > 0) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  // Group contributions by month
  const contributionsByMonth: Record<string, number> = {}

  for (const day of contributionDays) {
    const date = new Date(day.date)
    const monthKey = date.toLocaleDateString("en-US", { month: "short" })

    if (!contributionsByMonth[monthKey]) {
      contributionsByMonth[monthKey] = 0
    }

    contributionsByMonth[monthKey] += day.count
  }

  // Convert to array and ensure all months are included
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const contributionsByMonthArray = months.map((month) => ({
    month,
    contributions: contributionsByMonth[month] || 0,
  }))

  return {
    totalContributions,
    longestStreak,
    currentStreak,
    contributionsByMonth: contributionsByMonthArray,
  }
}

// Types for contribution data
export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  details?: {
    commits: number
    pullRequests: number
    issues: number
    reviews: number
  }
}

export interface ActivitySummary {
  totalContributions: number
  longestStreak: number
  currentStreak: number
  contributionsByMonth: {
    month: string
    contributions: number
  }[]
}

// Generate mock repositories for a day (since GitHub API doesn't provide this)
export function generateRepositoriesForDay(username: string, repos: GitHubRepo[]): string[] {
  if (repos.length === 0) return ["No repositories found"]

  // Return 1-3 random repos
  const count = Math.min(Math.floor(Math.random() * 3) + 1, repos.length)
  const shuffled = [...repos].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).map((repo) => repo.name)
}
