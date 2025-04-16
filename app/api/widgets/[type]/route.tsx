// src/app/api/widgets/[type]/route.ts

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { fetchUser, fetchRepos, processLanguageData } from '@/lib/github'; // Ensure these paths are correct

// NO font loading logic needed

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    console.log(`API Route invoked for type: ${params.type}`);
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const theme = searchParams.get('theme') || 'light';
    const color = searchParams.get('color') || '#2563eb';
    const repoName = searchParams.get('repo');

    console.log(`Params - username: ${username}, theme: ${theme}, color: ${color}, repo: ${repoName}`);

    if (!username) {
      console.error('Username is required');
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch data in parallel
    console.log(`Fetching user: ${username}`);
    const userPromise = fetchUser(username);
    console.log(`Fetching repos for: ${username}`);
    const reposPromise = fetchRepos(username);

    const [user, repos] = await Promise.all([userPromise, reposPromise]);
    console.log('User fetched:', !!user);
    console.log('Repos fetched:', repos?.length);

    if (!user) {
        console.error(`User not found: ${username}`);
        return new Response(JSON.stringify({ error: `GitHub user "${username}" not found.` }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let languages: Awaited<ReturnType<typeof processLanguageData>> = [];
    if (params.type === 'stats') {
        console.log('Processing language data...');
        languages = await processLanguageData(repos);
        console.log('Languages processed:', languages?.length);
    }

    // Theme setup
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1a1b1e' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#000000';
    const mutedColor = isDark ? '#a1a1aa' : '#71717a';
    const progressBgColor = isDark ? '#27272a' : '#f4f4f5';

    // --- Widget Components (Defined Inline) ---

    const ProfileWidget = () => (
        <div // Root - OK (already flex by default in ImageResponse)
          style={{
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            padding: '20px', backgroundColor: bgColor, color: textColor,
          }}
        >
          {/* Top Row: Avatar + Info */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center' }}> {/* OK: Has 2 children (img + div) */}
            <img
               src={user.avatar_url} // Ensure this URL is accessible
               width="80" height="80"
               style={{ borderRadius: '40px' }}
               alt={`${user.login}'s avatar`} />
            {/* User Info Column */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}> {/* OK: Multiple children, flex column */}
              {/* Name Div - needs flex if potentially empty user.name */}
              <div style={{ fontSize: '24px', fontWeight: 'bold', lineHeight: 1.2, display: 'flex' }}>
                <span>{user.name || user.login}</span>
              </div>
              {/* Username Div - needs flex */}
              <div style={{ fontSize: '16px', color: mutedColor, lineHeight: 1.2, display: 'flex' }}>
                <span>@{user.login}</span>
              </div>
              {/* Bio Div - OK (conditionally rendered, inner span) */}
              {user.bio &&
                <div style={{ fontSize: '14px', marginTop: '8px', lineHeight: 1.4, wordBreak: 'break-word', display: 'flex' }}>
                  <span>{user.bio}</span>
                </div>
              }
            </div>
          </div>
          {/* Bottom Row: Stats */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}> {/* OK: Has 2 children (div + div) */}
            {/* Repos Count Div - OK (already flex) */}
            <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>{user.public_repos}</span>
              <span style={{ color: mutedColor }}>repositories</span>
            </div>
            {/* Followers Count Div - OK (already flex) */}
            <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>{user.followers}</span>
              <span style={{ color: mutedColor }}>followers</span>
            </div>
          </div>
        </div>
      );

      const StatsWidget = () => (
        <div // Root - OK
            style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                padding: '20px', backgroundColor: bgColor, color: textColor,
            }}>
          {/* Title Div - OK (already flex) */}
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex' }}>
              <span>Language Statistics</span>
          </div>
          {/* Language List Div */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}> {/* OK: Parent is flex column */}
            {languages.length > 0 ? languages.slice(0, 3).map((lang) => (
              // Container for one language row - OK (flex column)
              <div key={lang.name} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Language Name + Percentage Div - OK (already flex) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                    <span>{lang.name}</span>
                    <span>{lang.percentage.toFixed(1)}%</span>
                </div>
                {/* Progress Bar container Div - OK (single child) */}
                <div style={{ width: '100%', height: '8px', backgroundColor: progressBgColor, borderRadius: '4px', overflow: 'hidden' }}>
                    {/* Progress Bar fill Div - OK (no children) */}
                    <div style={{ width: `${lang.percentage}%`, height: '100%', backgroundColor: lang.color || color, borderRadius: '4px' }} />
                </div>
              </div>
            )) : (
               // "No language data" Div - OK (already flex)
               <div style={{ color: mutedColor, fontSize: '14px', display: 'flex' }}>
                   <span>No language data available.</span>
               </div>
            )}
          </div>
        </div>
      );

      const ReposWidget = () => {
        const repo = repoName ? repos.find(r => r.name.toLowerCase() === repoName.toLowerCase()) : (repos.length > 0 ? repos[0] : null);

        // Fallback Div - OK (text child only)
        if (!repo) {
           return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: bgColor, color: mutedColor }}>Repository {repoName ? `"${repoName}" ` : ''}not found for user {username}.</div>;
        }

        // Main Repo Card Div - OK (flex column)
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '20px', backgroundColor: bgColor, color: textColor }}>
             {/* Repo Name Div - OK (already flex) */}
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex' }}>
                <span>{repo.name}</span>
            </div>
             {/* Repo Description Div - OK (already flex) */}
            <div style={{ fontSize: '14px', color: mutedColor, marginBottom: '16px', lineHeight: 1.4, maxHeight: '4.2em', overflow: 'hidden', display: 'flex' }}>
                <span>{repo.description || 'No description provided.'}</span>
            </div>
             {/* Repo Stats Container Div - OK (already flex) */}
            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
              {/* Star Div - OK (already flex) */}
              <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>⭐</span>
                  <span>{repo.stargazers_count}</span>
              </div>
              {/* Fork Div - OK (already flex) */}
              <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>🔀</span>
                  <span>{repo.forks_count}</span>
              </div>
              {/* Language Div - OK (conditionally rendered, already flex) */}
              {repo.language &&
                <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '16px' }}>📝</span>
                    <span>{repo.language}</span>
                </div>
              }
            </div>
          </div>
        );
      };

    // --- Select and Render Widget ---
    console.log(`Selecting widget component for type: ${params.type}`);
    let widgetComponent;
    switch (params.type) {
      case 'profile': widgetComponent = <ProfileWidget />; break;
      case 'stats': widgetComponent = <StatsWidget />; break;
      case 'repo': widgetComponent = <ReposWidget />; break;
      default:
        console.error(`Invalid widget type requested: ${params.type}`);
        return new Response(JSON.stringify({ error: `Invalid widget type: ${params.type}` }), {
             status: 400,
             headers: { 'Content-Type': 'application/json' },
        });
    }

    console.log('Generating ImageResponse...');
    // --- ImageResponse Options ---
    const imageOptions = {
        width: 600,
        height: 200,
        // NO fonts array needed
    };

    // Return ImageResponse directly
    return new ImageResponse(widgetComponent, imageOptions);

  } catch (error: any) {
    // Log the specific error causing the crash before sending generic response
    console.error('!!! Critical Error generating ImageResponse:', error);
    // If the error is the specific flexbox error, provide that detail
    const isFlexError = error instanceof Error && error.message.includes('Expected <div> to have explicit "display: flex"');
    const detailMessage = isFlexError ? error.message : (error instanceof Error ? error.message : 'An unknown error occurred');

    return new Response(
        JSON.stringify({
            error: 'Failed to generate widget image',
            details: detailMessage
        }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Keep runtime commented out or removed
// export const runtime = 'edge';