import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { StarIcon, GitForkIcon, CodeIcon } from "lucide-react"
import type { GitHubUser, GitHubRepo, GitHubLanguage } from "@/lib/github"

interface WidgetPreviewProps {
  type: "profile" | "repos" | "stats"
  user?: GitHubUser
  repo?: GitHubRepo
  languages?: GitHubLanguage[]
  theme: string
  primaryColor: string
}

export function WidgetPreview({ type, user, repo, languages, theme, primaryColor }: WidgetPreviewProps) {
  const themeClass = `theme-${theme}`
  
  if (type === "profile" && user) {
    return (
      <Card className={`${themeClass} border-2`} style={{ borderColor: primaryColor }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} />
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{user.name || user.login}</h3>
              <p className="text-sm text-muted-foreground">@{user.login}</p>
              {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div>
              <div className="font-bold">{user.public_repos}</div>
              <div className="text-xs text-muted-foreground">Repositories</div>
            </div>
            <div>
              <div className="font-bold">{user.followers}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="font-bold">{user.following}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "repos" && repo) {
    return (
      <Card className={`${themeClass} border-2`} style={{ borderColor: primaryColor }}>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg">{repo.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4" />
              <span>{repo.stargazers_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitForkIcon className="h-4 w-4" />
              <span>{repo.forks_count}</span>
            </div>
            {repo.language && (
              <div className="flex items-center gap-1">
                <CodeIcon className="h-4 w-4" />
                <span>{repo.language}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "stats" && languages) {
    return (
      <Card className={`${themeClass} border-2`} style={{ borderColor: primaryColor }}>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg">Language Statistics</h3>
          <div className="space-y-2 mt-4">
            {languages.slice(0, 3).map((lang) => (
              <div key={lang.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{lang.name}</span>
                  <span>{lang.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}