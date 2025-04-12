import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, GithubIcon, Users, MapPinIcon, LinkIcon, TwitterIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { GitHubUser } from "@/lib/github"

interface UserProfileProps {
  user: GitHubUser
}

export function UserProfile({ user }: UserProfileProps) {
  const joinedDate = new Date(user.created_at)
  const joinedFormatted = formatDistanceToNow(joinedDate, { addSuffix: true })

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <Avatar className="h-24 w-24 border">
        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} />
        <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="space-y-4 flex-1">
        <div>
          <h2 className="text-2xl font-bold">{user.name || user.login}</h2>
          <p className="text-muted-foreground">@{user.login}</p>
        </div>

        {user.bio && <p>{user.bio}</p>}

        <div className="flex flex-wrap gap-2">
          {user.company && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{user.company}</span>
            </Badge>
          )}

          {user.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5" />
              <span>{user.location}</span>
            </Badge>
          )}

          {user.blog && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" />
              <a
                href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Website
              </a>
            </Badge>
          )}

          {user.twitter_username && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <TwitterIcon className="h-3.5 w-3.5" />
              <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer">
                @{user.twitter_username}
              </a>
            </Badge>
          )}

          <Badge variant="secondary" className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Joined {joinedFormatted}</span>
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{user.followers} followers</span>
          </Badge>

          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{user.following} following</span>
          </Badge>
        </div>

        <Button variant="outline" size="sm" asChild>
          <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <GithubIcon className="h-4 w-4" />
            View on GitHub
          </a>
        </Button>
      </div>
    </div>
  )
}
