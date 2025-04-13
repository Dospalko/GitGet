"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { GitHubLanguage } from "@/lib/github"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

interface LanguageBreakdownProps {
  languages: GitHubLanguage[]
  isLoading?: boolean
}

export function LanguageBreakdown({ languages, isLoading = false }: LanguageBreakdownProps) {
  // Filter out languages with very small percentages (less than 1%)
  const significantLanguages = languages.filter((lang) => lang.percentage >= 1)

  return (
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
          >
            {significantLanguages.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="outline-none"
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
              <span className="text-sm text-foreground">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
