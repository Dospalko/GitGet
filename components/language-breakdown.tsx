"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { GitHubLanguage } from "@/lib/github"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LanguageBreakdownProps {
  languages: GitHubLanguage[]
  isLoading?: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Card className="p-3 !bg-popover border-border shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.value} repositories ({data.percentage.toFixed(1)}%)
        </p>
      </Card>
    )
  }
  return null
}

export function LanguageBreakdown({ languages, isLoading = false }: LanguageBreakdownProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading language data...
      </div>
    )
  }

  if (languages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No language data available
      </div>
    )
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

  return (
    <div className="h-[400px] w-full sm:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="35%"
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent, x, y, midAngle }) => {
              const RADIAN = Math.PI / 180
              const radius = 160
              const centerX = x
              const centerY = y
              const sin = Math.sin(-RADIAN * midAngle)
              const cos = Math.cos(-RADIAN * midAngle)
              const textAnchor = cos >= 0 ? 'start' : 'end'

              return (
                <text
                  x={centerX + cos * radius}
                  y={centerY + sin * radius}
                  fill="currentColor"
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className="text-xs sm:text-sm"
                >
                  {`${name} (${(percent * 100).toFixed(0)}%)`}
                </text>
              )
            }}
            className="transition-all duration-200 hover:opacity-80"
          >
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="transition-all duration-200 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            className="text-xs sm:text-sm"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
