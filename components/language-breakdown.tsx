"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { GitHubLanguage } from "@/lib/github"

interface LanguageBreakdownProps {
  languages: GitHubLanguage[]
}

export function LanguageBreakdown({ languages }: LanguageBreakdownProps) {
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

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} repositories`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
