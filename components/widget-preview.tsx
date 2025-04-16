// src/components/widget-preview.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar" // Added AvatarFallback
import { StarIcon, GitForkIcon, CodeIcon } from "lucide-react" // Assuming lucide-react is installed
import type { GitHubUser, GitHubRepo, GitHubLanguage } from "@/lib/github" // Ensure path is correct

interface WidgetPreviewProps {
  type: "profile" | "repo" | "stats"; // Corrected type 'repo'
  user?: GitHubUser;
  repo?: GitHubRepo;
  languages?: GitHubLanguage[];
  theme: string;
  primaryColor: string;
}

// Helper to get initials for Avatar fallback
const getInitials = (name?: string, login?: string): string => {
    if (name) {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    if (login) {
        return login.slice(0, 2).toUpperCase();
    }
    return 'GH'; // Default fallback
}

export function WidgetPreview({ type, user, repo, languages, theme, primaryColor }: WidgetPreviewProps) {
  // Define base styles and theme-specific overrides
  const isDark = theme === 'dark';
  const baseClasses = "border-2 rounded-lg overflow-hidden w-full max-w-[600px] aspect-[3/1]"; // Match image aspect ratio
  const themeClasses = isDark
    ? "bg-[#1a1b1e] text-white"
    : "bg-white text-black";
  const mutedTextClass = isDark ? "text-gray-400" : "text-gray-600";
  const progressBgClass = isDark ? "bg-gray-700" : "bg-gray-200";

  // --- Profile Preview ---
  if (type === "profile" && user) {
    return (
      <div className={`${baseClasses} ${themeClasses}`} style={{ borderColor: primaryColor }}>
        <div className="p-5 flex flex-col h-full"> {/* Use padding like API route */}
          {/* Top Row */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20"> {/* Match API size */}
              <AvatarImage src={user.avatar_url} alt={`${user.login}'s avatar`} />
              <AvatarFallback>{getInitials(user.name, user.login)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-2xl leading-tight">{user.name || user.login}</h3>
              <p className={`text-base ${mutedTextClass} leading-tight`}>@{user.login}</p>
              {user.bio && <p className="text-sm mt-2 line-clamp-2">{user.bio}</p>} {/* Use line-clamp */}
            </div>
          </div>
          {/* Bottom Row */}
          <div className="flex gap-4 mt-auto pt-2"> {/* Use mt-auto to push to bottom */}
            <div className={`text-sm ${mutedTextClass}`}>
              <span className="font-bold text-foreground">{user.public_repos}</span> repositories
            </div>
            <div className={`text-sm ${mutedTextClass}`}>
              <span className="font-bold text-foreground">{user.followers}</span> followers
            </div>
            {/* Optional: Add following count if desired */}
            {/* <div className={`text-sm ${mutedTextClass}`}>
              <span className="font-bold text-foreground">{user.following}</span> following
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  // --- Repo Preview ---
  if (type === "repo" && repo) { // Check for 'repo' type
    return (
      <div className={`${baseClasses} ${themeClasses}`} style={{ borderColor: primaryColor }}>
        <div className="p-5 flex flex-col h-full">
          <h3 className="font-bold text-xl leading-tight truncate">{repo.name}</h3>
          <p className={`text-sm ${mutedTextClass} mt-2 line-clamp-2 flex-grow`}>{repo.description || "No description provided."}</p> {/* Allow description to grow */}
          <div className="flex gap-4 mt-auto pt-2"> {/* mt-auto pushes to bottom */}
            <div className="flex items-center gap-1 text-sm">
              <StarIcon className="h-4 w-4" />
              <span>{repo.stargazers_count}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <GitForkIcon className="h-4 w-4" />
              <span>{repo.forks_count}</span>
            </div>
            {repo.language && (
              <div className="flex items-center gap-1 text-sm">
                <CodeIcon className="h-4 w-4" />
                <span>{repo.language}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Stats Preview ---
  if (type === "stats" && languages) {
    return (
      <div className={`${baseClasses} ${themeClasses}`} style={{ borderColor: primaryColor }}>
        <div className="p-5 flex flex-col h-full">
          <h3 className="font-bold text-xl mb-4">Language Statistics</h3>
          <div className="space-y-3 flex-grow"> {/* Allow space to grow */}
            {languages.length > 0 ? languages.slice(0, 3).map((lang) => (
              <div key={lang.name} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>{lang.name}</span>
                  <span>{lang.percentage.toFixed(1)}%</span>
                </div>
                <div className={`h-2 ${progressBgClass} rounded-full overflow-hidden`}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lang.percentage}%`,
                      // Use primaryColor as fallback if lang.color is missing
                      backgroundColor: lang.color || primaryColor,
                    }}
                  />
                </div>
              </div>
            )) : (
                <p className={`text-sm ${mutedTextClass}`}>No language data available.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no props match or type is wrong
  return (
      <div className={`${baseClasses} ${themeClasses} flex items-center justify-center`} style={{ borderColor: primaryColor }}>
          <p className={`${mutedTextClass}`}>Preview unavailable</p>
      </div>
  );
}