"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts"
import type { GitHubLanguage, GitHubRepo } from "@/lib/github"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StarIcon, GitForkIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { LANGUAGE_COLORS } from "@/lib/github"

const DEFAULT_COLOR = "#6e7681"

interface LanguageBreakdownProps {
  languages: GitHubLanguage[]
  repos?: GitHubRepo[]
  isLoading?: boolean
}

function LanguageBreakdownSkeleton() {
  return (
    <div className="space-y-8">
      {/* Pie Chart Skeleton */}
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="relative">
          <Skeleton className="w-[240px] h-[240px] rounded-full" />
          <Skeleton className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full" />
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="flex justify-center gap-4 flex-wrap">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

function LanguageDialogSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-4 w-full max-w-[300px]" />
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function LanguageBreakdown({ languages, repos = [], isLoading = false }: LanguageBreakdownProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const [viewType, setViewType] = useState<"pie" | "bar">("pie")
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isLoading) {
    return <LanguageBreakdownSkeleton />
  }

  if (languages.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No language data available</div>
  }

  // Limit to top 10 languages and group the rest as "Other"
  let formattedData: GitHubLanguage[] = []

  if (languages.length > 10) {
    const topLanguages = languages.slice(0, 9)
    const otherLanguages = languages.slice(9)

    const otherValue = otherLanguages.reduce((sum, lang) => sum + lang.value, 0)
    const otherPercentage = otherLanguages.reduce((sum, lang) => sum + lang.percentage, 0)

    formattedData = [
      ...topLanguages,
      {
        name: "Other",
        value: otherValue,
        color: "#6e7681",
        percentage: otherPercentage,
      },
    ]
  } else {
    formattedData = languages
  }

  // For bar chart, sort by value
  const barData = [...formattedData].sort((a, b) => b.value - a.value)

  // Calculate total repositories
  const totalRepos = formattedData.reduce((sum, lang) => sum + lang.value, 0)

  // Filter out languages with very small percentages (less than 1%)
  const significantLanguages = languages.filter((lang) => lang.percentage >= 1)

  // Get repositories for selected language
  const getRepositoriesForLanguage = (language: string) => {
    if (!repos) return []

    return repos
      .filter((repo) => {
        // Check if the repository's primary language matches
        if (repo.language === language) return true

        return false
      })
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
  }

  const handleLanguageClick = (language: string) => {
    setSelectedLanguage(language)
    setIsDialogOpen(true)
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props

    return (
      <g>
        <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill={fill} className="text-lg font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={fill} className="text-2xl font-bold">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill="#999" className="text-sm">
          {`${payload.value} repos`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Language Breakdown</CardTitle>
            <CardDescription>Distribution of programming languages across repositories</CardDescription>
          </div>
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as "pie" | "bar")} className="w-[180px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pie">Pie Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {viewType === "pie" ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={formattedData}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  onClick={(entry) => handleLanguageClick(entry.name)}
                  className="cursor-pointer"
                  animationDuration={800}
                  animationBegin={0}
                  animationEasing="ease-out"
                >
                  {formattedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="outline-none hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none" }} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value, entry: any) => (
                    <span
                      className="text-sm text-foreground cursor-pointer hover:underline"
                      onClick={() => handleLanguageClick(value)}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#888" }}
                  width={80}
                  tickFormatter={(value) => (value.length > 12 ? `${value.substring(0, 12)}...` : value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  nameKey="name"
                  animationDuration={1000}
                  animationBegin={0}
                  animationEasing="ease-out"
                  onClick={(data) => handleLanguageClick(data.name)}
                  className="cursor-pointer"
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {formattedData.slice(0, 4).map((lang, index) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => handleLanguageClick(lang.name)}
            >
              <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: lang.color }}></div>
              <span className="font-medium text-sm">{lang.name}</span>
              <span className="text-xs text-muted-foreground">{lang.value} repos</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-sm text-center text-muted-foreground">
          Total: <span className="font-medium text-foreground">{totalRepos}</span> repositories
        </div>

        {/* Language Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: significantLanguages.find((lang) => lang.name === selectedLanguage)?.color,
                  }}
                />
                {selectedLanguage} Projects
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <LanguageDialogSkeleton />
              ) : (
                selectedLanguage &&
                getRepositoriesForLanguage(selectedLanguage).map((repo) => (
                  <Card key={repo.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {repo.name}
                          </a>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {repo.description || "No description provided"}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                LANGUAGE_COLORS[repo.language as keyof typeof LANGUAGE_COLORS] || DEFAULT_COLOR,
                            }}
                          />
                          {repo.language}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <StarIcon className="mr-1 h-4 w-4" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center">
                          <GitForkIcon className="mr-1 h-4 w-4" />
                          {repo.forks_count}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Card className="p-3 !bg-popover border-border shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="font-medium text-foreground">{data.name}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {data.value} repositories ({data.percentage.toFixed(1)}%)
        </p>
      </Card>
    )
  }
  return null
}
