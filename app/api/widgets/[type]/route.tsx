import { ImageResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { fetchUser, fetchRepos, processLanguageData } from '@/lib/github'

// Font loading for ImageResponse
const interRegular = fetch(
  new URL('/public/fonts/Inter-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

const interBold = fetch(
  new URL('/public/fonts/Inter-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

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
    const [user, repos, interRegularData, interBoldData] = await Promise.all([
      fetchUser(username),
      fetchRepos(username),
      interRegular,
      interBold,
    ])

    const languages = await processLanguageData(repos)
    const isDark = theme === 'dark'
    const bgColor = isDark ? '#1a1b1e' : '#ffffff'
    const textColor = isDark ? '#ffffff' : '#000000'
    const mutedColor = isDark ? '#a1a1aa' : '#71717a'

    const ProfileWidget = () => (
      <div
        style={{
          display: 'flex',
          padding: '20px',
          width: '100%',
          height: '100%',
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: 'Inter',
        }}
      >
        <img
          src={user.avatar_url}
          width="80"
          height="80"
          style={{ borderRadius: '40px', marginRight: '16px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {user.name || user.login}
          </div>
          <div style={{ fontSize: '16px', color: mutedColor }}>@{user.login}</div>
          {user.bio && (
            <div style={{ fontSize: '14px', marginTop: '8px' }}>{user.bio}</div>
          )}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '12px',
              fontSize: '14px',
            }}
          >
            <div>
              <span style={{ fontWeight: 'bold' }}>{user.public_repos}</span>{' '}
              <span style={{ color: mutedColor }}>repositories</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>{user.followers}</span>{' '}
              <span style={{ color: mutedColor }}>followers</span>
            </div>
          </div>
        </div>
      </div>
    )

    const StatsWidget = () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          width: '100%',
          height: '100%',
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: 'Inter',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Language Statistics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {languages.slice(0, 3).map((lang) => (
            <div key={lang.name} style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span>{lang.name}</span>
                <span>{lang.percentage.toFixed(1)}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${lang.percentage}%`,
                    height: '100%',
                    backgroundColor: lang.color,
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )

    const ReposWidget = () => {
      const repo = repos[0] // You might want to add a repo parameter to select specific repo
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            width: '100%',
            height: '100%',
            backgroundColor: bgColor,
            color: textColor,
            fontFamily: 'Inter',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{repo.name}</div>
          <div
            style={{ fontSize: '14px', color: mutedColor, marginTop: '8px' }}
          >
            {repo.description}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '16px',
              fontSize: '14px',
            }}
          >
            <div>⭐ {repo.stargazers_count}</div>
            <div>🔀 {repo.forks_count}</div>
            {repo.language && <div>📝 {repo.language}</div>}
          </div>
        </div>
      )
    }

    return new ImageResponse(
      params.type === 'profile' ? (
        <ProfileWidget />
      ) : params.type === 'stats' ? (
        <StatsWidget />
      ) : (
        <ReposWidget />
      ),
      {
        width: 600,
        height: 200,
        fonts: [
          {
            name: 'Inter',
            data: interRegularData,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: interBoldData,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    )
  } catch (error) {
    console.error('Error generating widget:', error)
    return new Response('Error generating widget', { status: 500 })
  }
}

export const runtime = 'edge'
