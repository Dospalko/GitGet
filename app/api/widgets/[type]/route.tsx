import { ImageResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { fetchUser, fetchRepos, processLanguageData } from '@/lib/github'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get('username')
  const theme = searchParams.get('theme') || 'light'
  const color = searchParams.get('color') || '#2563eb'

  if (!username) {
    return new Response('Username is required', { status: 400 })
  }

  try {
    const user = await fetchUser(username)
    const repos = await fetchRepos(username)
    const languages = await processLanguageData(repos)

    return new ImageResponse(
      new Response(
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: theme === 'dark' ? '#1a1b1e' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            padding: '20px',
          }}
        >
          {params.type === 'profile' && (
            <ProfileWidgetImage user={user} theme={theme} color={color} />
          )}
          {params.type === 'repos' && (
            <ReposWidgetImage repos={repos} theme={theme} color={color} />
          )}
          {params.type === 'stats' && (
            <StatsWidgetImage languages={languages} theme={theme} color={color} />
          )}
        </div>
      ),
      {
        width: 600,
        height: 200,
      }
    )
  } catch (error) {
    return new Response('Error generating widget', { status: 500 })
  }
}
