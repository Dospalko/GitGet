"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { GitHubLanguage, GitHubRepo } from "@/lib/github"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StarIcon, GitForkIcon } from "lucide-react"
import { useState } from "react"
import { LANGUAGE_COLORS } from "@/lib/github"

const DEFAULT_COLOR = "#6e7681"

interface LanguageBreakdownProps {
  languages: GitHubLanguage[]
  repos: GitHubRepo[]
  isLoading?: boolean
}

export function LanguageBreakdown({ languages, repos = [], isLoading = false }: LanguageBreakdownProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter out languages with very small percentages (less than 1%)
  const significantLanguages = languages.filter((lang) => lang.percentage >= 1)

  // Get repositories for selected language
  const getRepositoriesForLanguage = (language: string) => {
    if (!repos) return []
    
    return repos.filter(repo => {
      // Check if the repository's primary language matches
      if (repo.language === language) return true
      
      // Also check in the detailed languages object if available
      if (repo.languages && Object.keys(repo.languages).includes(language)) return true
      
      return false
    }).sort((a, b) => b.stargazers_count - a.stargazers_count)
  }

  const handleLanguageClick = (language: string) => {
    setSelectedLanguage(language)
    setIsDialogOpen(true)
  }

  return (
    <>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={significantLanguages}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              isAnimationActive={!isLoading}
              onClick={(entry) => handleLanguageClick(entry.name)}
              className="cursor-pointer"
            >
              {significantLanguages.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="outline-none hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>

            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              height={36}
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ 
                  backgroundColor: significantLanguages.find(
                    lang => lang.name === selectedLanguage
                  )?.color 
                }} 
              />
              {selectedLanguage} Projects
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedLanguage && getRepositoriesForLanguage(selectedLanguage).map((repo) => (
              <Card key={repo.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      <a 
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
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
                          backgroundColor: LANGUAGE_COLORS[repo.language as keyof typeof LANGUAGE_COLORS] || DEFAULT_COLOR 
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
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
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
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <p className="font-medium text-foreground">{data.name}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {formatBytes(data.value)} ({data.percentage.toFixed(1)}%)
        </p>
      </Card>
    )
  }
  return null
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  
  return `${value.toFixed(1)} ${units[unitIndex]}`
}
