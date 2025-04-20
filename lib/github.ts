// lib/github.ts
// Shared GitHub client logic with server‑side caching + client‑side proxy to our API

// Base URL for GitHub REST API
const GITHUB_API_BASE = "https://api.github.com"

// Read token from env (only available on server)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN

// Default headers for server‑side fetches
const serverHeaders = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "GitHub-Profile-Visualizer",
  Authorization: `Bearer ${GITHUB_TOKEN}`,
}

// Utility: detect if code is running in the browser
const isBrowser = typeof window !== "undefined"

// --- Server‑side cache setup ---
interface CacheEntry<T> {
  data: T
  timestamp: number
}
const cache = new Map<string, CacheEntry<any>>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Server‑side fetch with in‑memory cache.
 */
async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }

  const response = await fetch(url, { headers: serverHeaders })
  if (!response.ok) {
    if (response.status === 403 && response.headers.get("X-RateLimit-Remaining") === "0") {
      throw new Error("GitHub API rate limit exceeded. Check your GITHUB_TOKEN.")
    }
    throw new Error(`GitHub API error: ${response.status} - ${await response.text()}`)
  }

  const data = await response.json()
  cache.set(url, { data, timestamp: Date.now() })
  return data as T
}

// --- Type definitions for GitHub data ---
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
  languages_url: string
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
  repo: { name: string }
  payload: any
}

export interface GitHubLanguage {
  name: string
  value: number
  color: string
  percentage: number
}

// Mapping of popular languages to colors
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
const DEFAULT_COLOR = "#6e7681"

// --- Client‑side proxy or server‑side direct fetch ---

/**
 * Fetch a single GitHub user.
 * - In browser: proxies to our `/api/github/[username]` route (hides token).
 * - On server: fetches directly from GitHub with caching.
 */
export async function fetchUser(username: string): Promise<GitHubUser> {
  if (isBrowser) {
    const res = await fetch(`/api/github/${username}`)
    const { user, error } = await res.json()
    if (!res.ok) throw new Error(error || "Unknown error fetching user")
    return user
  }
  return fetchWithCache<GitHubUser>(`${GITHUB_API_BASE}/users/${username}`)
}

/**
 * Fetch all repos for a user with pagination.
 * - In browser: proxies to our API route.
 * - On server: uses fetchWithCache and loops pages.
 */
export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  if (isBrowser) {
    const res = await fetch(`/api/github/${username}`)
    const { repos, error } = await res.json()
    if (!res.ok) throw new Error(error || "Unknown error fetching repos")
    return repos
  }

  const allRepos: GitHubRepo[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const repos = await fetchWithCache<GitHubRepo[]>(
      `${GITHUB_API_BASE}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`
    )
    allRepos.push(...repos)
    if (repos.length < perPage) break
    page++
  }

  return allRepos
}

/**
 * Fetch recent events for a user (up to 300).
 * - In browser: proxies to our API route.
 * - On server: loops through pages with caching.
 */
export async function fetchEvents(username: string): Promise<GitHubEvent[]> {
  if (isBrowser) {
    const res = await fetch(`/api/github/${username}`)
    const { events, error } = await res.json()
    if (!res.ok) throw new Error(error || "Unknown error fetching events")
    return events
  }

  const allEvents: GitHubEvent[] = []
  const pages = 3
  for (let page = 1; page <= pages; page++) {
    const events = await fetchWithCache<GitHubEvent[]>(
      `${GITHUB_API_BASE}/users/${username}/events?per_page=100&page=${page}`
    )
    allEvents.push(...events)
    if (events.length < 100) break
  }
  return allEvents
}

// Enhanced language processing
export async function processLanguageData(repos: GitHubRepo[]): Promise<GitHubLanguage[]> {
  // Fetch language data for each repository
  const repoLanguages = await Promise.all(
    repos.map(async (repo) => {
      try {
        // Use the correct GitHub API endpoint for languages
        const languagesUrl = `${GITHUB_API_BASE}/repos/${repo.full_name}/languages`
        const languages = await fetchWithCache<Record<string, number>>(languagesUrl)
        return languages
      } catch (error) {
        console.error(`Error fetching languages for ${repo.full_name}:`, error)
        return null
      }
    }),
  )

  // Aggregate language data
  const languageTotals: Record<string, number> = {}

  repoLanguages.forEach((languages) => {
    if (!languages) return

    Object.entries(languages).forEach(([language, bytes]) => {
      languageTotals[language] = (languageTotals[language] || 0) + bytes
    })
  })

  // Calculate percentages and create final language data
  const total = Object.values(languageTotals).reduce((sum, count) => sum + count, 0)

  return Object.entries(languageTotals)
    .map(([name, value]) => ({
      name,
      value,
      color: LANGUAGE_COLORS[name] || DEFAULT_COLOR,
      percentage: (value / total) * 100,
    }))
    .sort((a, b) => b.value - a.value)
}

// Process events to generate more accurate contribution data
export function processEventsToContributions(events: GitHubEvent[]): {
  contributionDays: ContributionDay[]
  activitySummary: ActivitySummary
} {
  const contributionsByDate = new Map<string, ContributionDay>()

  // Initialize past 365 days
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

  // Process events
  events.forEach((event) => {
    const date = event.created_at.split("T")[0]
    const day = contributionsByDate.get(date)
    if (!day) return

    switch (event.type) {
      case "PushEvent":
        const commits = event.payload.commits?.length || 0
        day.count += commits
        day.details.commits += commits
        break
      case "PullRequestEvent":
        if (event.payload.action === "opened") {
          day.count += 1
          day.details.pullRequests += 1
        }
        break
      case "IssuesEvent":
        if (event.payload.action === "opened") {
          day.count += 1
          day.details.issues += 1
        }
        break
      case "PullRequestReviewEvent":
        day.count += 1
        day.details.reviews += 1
        break
    }

    // Calculate activity level (0-4)
    day.level = day.count === 0 ? 0 : day.count <= 2 ? 1 : day.count <= 5 ? 2 : day.count <= 10 ? 3 : 4
  })

  // Calculate streaks and monthly contributions
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let totalContributions = 0
  const contributionsByMonth: Record<string, number> = {}

  Array.from(contributionsByDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((day) => {
      // Update streaks
      if (day.count > 0) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }

      // Update current streak if it's within the last 2 days
      const dayDate = new Date(day.date)
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      if (dayDate >= twoDaysAgo && day.count > 0) {
        currentStreak = tempStreak
      }

      // Update monthly contributions
      const month = new Date(day.date).toLocaleString("en-US", { month: "short" })
      contributionsByMonth[month] = (contributionsByMonth[month] || 0) + day.count
      totalContributions += day.count
    })

  return {
    contributionDays: Array.from(contributionsByDate.values()),
    activitySummary: {
      totalContributions,
      longestStreak,
      currentStreak,
      contributionsByMonth: Object.entries(contributionsByMonth).map(([month, contributions]) => ({
        month,
        contributions,
      })),
    },
  }
}

// Types for contribution data
export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  details: {
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
