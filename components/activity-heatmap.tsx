"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  TrendingUp,
  Clock,
  BarChart2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type ContributionDay, type ActivitySummary, type GitHubRepo, generateRepositoriesForDay } from "@/lib/github"
import { motion, AnimatePresence } from "framer-motion"

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
  const [activeTab, setActiveTab] = useState("calendar")
  const [animateCalendar, setAnimateCalendar] = useState(false)

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
    setAnimateCalendar(true)
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentMonth(newDate)
  }

  // Navigate to next month
  const nextMonth = () => {
    setAnimateCalendar(true)
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentMonth(newDate)
  }

  // Reset animation flag after animation completes
  useEffect(() => {
    if (animateCalendar) {
      const timer = setTimeout(() => setAnimateCalendar(false), 300)
      return () => clearTimeout(timer)
    }
  }, [animateCalendar])

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

  // Prepare data for time distribution chart
  const getTimeDistributionData = () => {
    const hourCounts = Array(24).fill(0)

    contributionData.forEach((day) => {
      if (day.count > 0) {
        // Simulate time distribution since GitHub API doesn't provide this
        // In a real app, you would use actual timestamps from events
        const hour = new Date(day.date).getHours() || Math.floor(Math.random() * 24)
        hourCounts[hour] += day.count
      }
    })

    return hourCounts.map((count, hour) => ({
      hour: hour.toString().padStart(2, "0") + ":00",
      contributions: count,
    }))
  }

  // Prepare data for weekly activity chart
  const getWeeklyActivityData = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayCounts = Array(7).fill(0)

    contributionData.forEach((day) => {
      if (day.count > 0) {
        const dayOfWeek = new Date(day.date).getDay()
        dayCounts[dayOfWeek] += day.count
      }
    })

    return days.map((day, index) => ({
      day: day.substring(0, 3),
      contributions: dayCounts[index],
    }))
  }

  // Prepare data for contribution trend chart
  const getTrendData = () => {
    // Group by week
    const weeks: Record<string, number> = {}

    // Sort by date
    const sortedData = [...contributionData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    sortedData.forEach((day) => {
      const date = new Date(day.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeks[weekKey]) {
        weeks[weekKey] = 0
      }
      weeks[weekKey] += day.count
    })

    // Convert to array and take last 12 weeks
    return Object.entries(weeks)
      .map(([week, count]) => ({
        week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        contributions: count,
      }))
      .slice(-12)
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
  const totalDaysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
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
          color="bg-blue-50 dark:bg-blue-950"
          iconColor="text-blue-500"
        />
        <ActivityCard
          title="Longest Streak"
          value={activitySummary?.longestStreak || 0}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Consecutive days"
          color="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-500"
        />
        <ActivityCard
          title="Current Streak"
          value={activitySummary?.currentStreak || 0}
          icon={<IssueClosedIcon className="h-5 w-5" />}
          description="Consecutive days"
          color="bg-purple-50 dark:bg-purple-950"
          iconColor="text-purple-500"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="pt-6">
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

                {/* Row-based calendar layout with animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMonth.toString()}
                    initial={{ opacity: 0, x: animateCalendar ? -20 : 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
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
                              <motion.button
                                key={dayIndex}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
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
                              </motion.button>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Click on a day to view detailed activity. Note: GitHub API provides limited historical data.
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Contribution Trends
              </CardTitle>
              <CardDescription>Weekly contribution patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} contributions`, "Activity"]}
                      contentStyle={{
                        borderRadius: "0.5rem",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--background))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="contributions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>Contributions by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getWeeklyActivityData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} contributions`, "Activity"]}
                        contentStyle={{
                          borderRadius: "0.5rem",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--background))",
                        }}
                      />
                      <Bar
                        dataKey="contributions"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Distribution
                </CardTitle>
                <CardDescription>Activity by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTimeDistributionData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" tickFormatter={(value) => value.split(":")[0]} />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} contributions`, "Activity"]}
                        contentStyle={{
                          borderRadius: "0.5rem",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--background))",
                        }}
                      />
                      <Bar
                        dataKey="contributions"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>Contributions by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitySummary?.contributionsByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                <Bar
                  dataKey="contributions"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Contributions"
                  animationDuration={1000}
                />
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
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg"
                    >
                      <GitCommitIcon className="h-5 w-5 mb-1 text-blue-500" />
                      <span className="text-xl font-bold">{selectedDay.details?.commits || 0}</span>
                      <span className="text-xs text-muted-foreground">Commits</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center justify-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg"
                    >
                      <GitPullRequestIcon className="h-5 w-5 mb-1 text-purple-500" />
                      <span className="text-xl font-bold">{selectedDay.details?.pullRequests || 0}</span>
                      <span className="text-xs text-muted-foreground">Pull Requests</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg"
                    >
                      <IssueClosedIcon className="h-5 w-5 mb-1 text-emerald-500" />
                      <span className="text-xl font-bold">{selectedDay.details?.issues || 0}</span>
                      <span className="text-xs text-muted-foreground">Issues</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col items-center justify-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg"
                    >
                      <Calendar className="h-5 w-5 mb-1 text-amber-500" />
                      <span className="text-xl font-bold">{selectedDay.details?.reviews || 0}</span>
                      <span className="text-xs text-muted-foreground">Reviews</span>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <h4 className="text-sm font-medium">Repositories worked on:</h4>
                    <div className="flex flex-wrap gap-2">
                      {generateRepositoriesForDay(username, repos).map((repo, i) => (
                        <Badge key={i} variant="secondary" className="bg-muted">
                          {repo}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
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
  color = "bg-muted",
  iconColor = "text-primary",
}: {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  color?: string
  iconColor?: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className={`overflow-hidden ${color} border-none`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className={iconColor}>{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
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
