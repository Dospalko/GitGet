// app/api/github/[username]/route.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cache the API response at the edge for 60 seconds
export const revalidate = 60

/**
 * Serverless handler that proxies GitHub API calls,
 * injecting your GITHUB_TOKEN server‑side.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Missing GITHUB_TOKEN" }, { status: 500 })
  }

  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
  }

  try {
    // Fetch user, repos, and events in parallel
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${params.username}`, { headers }),
      fetch(`https://api.github.com/users/${params.username}/repos?per_page=100`, { headers }),
      fetch(`https://api.github.com/users/${params.username}/events`, { headers }),
    ])

    // If any failed, return the error text and status
    if (!userRes.ok || !reposRes.ok || !eventsRes.ok) {
      const errText = await userRes.text()
      return NextResponse.json({ error: errText }, { status: userRes.status })
    }

    // Parse JSON bodies
    const [user, repos, events] = await Promise.all([
      userRes.json(),
      reposRes.json(),
      eventsRes.json(),
    ])

    // Return combined payload to the client
    return NextResponse.json({ user, repos, events })
  } catch (err) {
    console.error("Error in /api/github route:", err)
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
  }
}
