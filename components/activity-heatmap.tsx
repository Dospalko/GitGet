"use client"

import type React from "react"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Calendar,
  GitCommitIcon,
  GitPullRequestIcon,
  FolderClosedIcon as IssueClosedIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { type ContributionDay, type ActivitySummary, type GitHubRepo, generateRepositoriesForDay } from "@/lib/github"

interface ActivityHeatmapProps {
  username: string
  contributionData: ContributionDay[]
  activitySummary: ActivitySummary | null
  repos: GitHubRepo[]
}

export function ActivityHeatmap({ username, contributionData, activitySummary, repos }: ActivityHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get days for the current month view
  const getDaysInMonth = () => {
    if (!contributionData.length) return []

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Filter days that belong to the current month view
    return contributionData.filter((day) => {
      const date = new Date(day.date)
      return date.getFullYear() === year && date.getMonth() === month
    })
  }

  // Navigate to previous month
  const prevMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentMonth(newDate)
  }

  // Navigate to next month
  const nextMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentMonth(newDate)
  }

  // Handle day click
  const handleDayClick = (day: ContributionDay) => {
    setSelectedDay(day)
    setIsDialogOpen(true)
  }

  // Format month name
  const formatMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Check if next month navigation should be disabled
  const isNextMonthDisabled = () => {
    const now = new Date()
    return currentMonth.getFullYear() >= now.getFullYear() && currentMonth.getMonth() >= now.getMonth()
  }

  if (!contributionData.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Limited contribution data available. GitHub API provides only recent events.
        </AlertDescription>
      </Alert>
    )
  }

  const daysInMonth = getDaysInMonth()

  // Group days by week for the row-based layout
  const totalDaysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  // Create an array of all days in the month
  const allDaysInMonth: (ContributionDay | null)[] = []

  // First, fill with nulls
  for (let i = 1; i <= totalDaysInMonth; i++) {
    allDaysInMonth.push(null)
  }

  // Then populate with actual data
  daysInMonth.forEach((day) => {
    const dayOfMonth = new Date(day.date).getDate()
    allDaysInMonth[dayOfMonth - 1] = day
  })

  // Fill in any missing days with empty data
  for (let i = 0; i < allDaysInMonth.length; i++) {
    if (allDaysInMonth[i] === null) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
      allDaysInMonth[i] = {
        date: date.toISOString().split("T")[0],
        count: 0,
        level: 0,
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActivityCard
          title="Total Contributions"
          value={activitySummary?.totalContributions || 0}
          icon={<GitCommitIcon className="h-5 w-5" />}
          description="Based on available data"
        />
        <ActivityCard
          title="Longest Streak"
          value={activitySummary?.longestStreak || 0}
          icon={<GitPullRequestIcon className="h-5 w-5" />}
          description="Consecutive days"
        />
        <ActivityCard
          title="Current Streak"
          value={activitySummary?.currentStreak || 0}
          icon={<IssueClosedIcon className="h-5 w-5" />}
          description="Consecutive days"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Contribution Calendar
              </CardTitle>
              <CardDescription>Activity by month</CardDescription>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <h3 className="text-lg font-medium">{formatMonthName(currentMonth)}</h3>
              <Button variant="outline" size="sm" onClick={nextMonth} disabled={isNextMonthDisabled()}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Row-based calendar layout */}
            <div className="space-y-6">
              {/* Week days row */}
              <div className="flex justify-between px-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="w-14 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar rows - each row represents a week of the month */}
              <div className="space-y-4">
                {Array.from({ length: Math.ceil(totalDaysInMonth / 7) }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex justify-between">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const dayNumber = weekIndex * 7 + dayIndex
                      const day = dayNumber < allDaysInMonth.length ? allDaysInMonth[dayNumber] : null

                      if (!day) {
                        return <div key={dayIndex} className="w-14 h-14" />
                      }

                      return (
                        <button
                          key={dayIndex}
                          className={`w-14 h-14 flex flex-col items-center justify-center rounded-md border ${getContributionColor(
                            day.level,
                          )} hover:ring-2 hover:ring-primary/50 transition-all`}
                          onClick={() => handleDayClick(day)}
                        >
                          <span className="text-sm font-medium">{new Date(day.date).getDate()}</span>
                          {day.count > 0 && (
                            <span className="text-xs mt-1">
                              {day.count} {day.count === 1 ? "contrib" : "contribs"}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Click on a day to view detailed activity. Note: GitHub API provides limited historical data.
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>Contributions by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitySummary?.contributionsByMonth || []}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} contributions`, "Activity"]}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--background))",
                  }}
                />
                <Bar dataKey="contributions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Contributions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground italic">
        Note: GitHub API provides limited historical data. Some contribution data may be approximated.
      </div>

      {/* Day Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Activity on {selectedDay && formatDate(selectedDay.date)}
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>
              {selectedDay?.count || 0} contribution{selectedDay?.count !== 1 ? "s" : ""} on this day
            </DialogDescription>
          </DialogHeader>

          {selectedDay && (
            <div className="space-y-4">
              {selectedDay.count > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <GitCommitIcon className="h-5 w-5 mb-1 text-primary" />
                      <span className="text-xl font-bold">{selectedDay.details?.commits || 0}</span>
                      <span className="text-xs text-muted-foreground">Commits</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <GitPullRequestIcon className="h-5 w-5 mb-1 text-primary" />
                      <span className="text-xl font-bold">{selectedDay.details?.pullRequests || 0}</span>
                      <span className="text-xs text-muted-foreground">Pull Requests</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <IssueClosedIcon className="h-5 w-5 mb-1 text-primary" />
                      <span className="text-xl font-bold">{selectedDay.details?.issues || 0}</span>
                      <span className="text-xs text-muted-foreground">Issues</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <Calendar className="h-5 w-5 mb-1 text-primary" />
                      <span className="text-xl font-bold">{selectedDay.details?.reviews || 0}</span>
                      <span className="text-xs text-muted-foreground">Reviews</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Repositories worked on:</h4>
                    <div className="flex flex-wrap gap-2">
                      {generateRepositoriesForDay(username, repos).map((repo, i) => (
                        <Badge key={i} variant="secondary">
                          {repo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-muted-foreground">No activity recorded on this day</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ActivityCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: number
  icon: React.ReactNode
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}

function getContributionColor(level: number): string {
  switch (level) {
    case 0:
      return "bg-gray-100 dark:bg-gray-800/50"
    case 1:
      return "bg-emerald-200 dark:bg-emerald-900/70"
    case 2:
      return "bg-emerald-300 dark:bg-emerald-700"
    case 3:
      return "bg-emerald-500 dark:bg-emerald-500"
    case 4:
      return "bg-emerald-700 dark:bg-emerald-300"
    default:
      return "bg-gray-100 dark:bg-gray-800/50"
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
