import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const username = params.username
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Missing GITHUB_TOKEN' }, { status: 500 })
  }

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`https://api.github.com/users/${username}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])

    if (!userRes.ok || !reposRes.ok || !eventsRes.ok) {
      const message = await userRes.text()
      return NextResponse.json({ error: message }, { status: userRes.status })
    }

    const [user, repos, events] = await Promise.all([
      userRes.json(),
      reposRes.json(),
      eventsRes.json(),
    ])

    return NextResponse.json({ user, repos, events })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
