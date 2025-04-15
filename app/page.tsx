"use client"

import type React from "react"
import { useState } from "react"
import { GitHubProfileVisualizer } from "@/components/github-profile-visualizer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GithubIcon, BarChart3, PieChart, LineChart, Activity, Code2, Star, LogIn, ChevronRight } from 'lucide-react'
import { LoginDialog } from "@/components/login-dialog"

export default function Home() {
  const [username, setUsername] = useState("")
  const [searchedUsername, setSearchedUsername] = useState("")
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setSearchedUsername(username)
      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GithubIcon className="h-6 w-6" />
            <span className="font-bold text-lg">GitViz</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowLoginDialog(true)}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/30 blur-3xl"></div>
            <div className="absolute top-60 right-20 w-60 h-60 rounded-full bg-blue-500/30 blur-3xl"></div>
            <div className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-emerald-500/30 blur-3xl"></div>
            
            {/* GitHub-like grid pattern */}
            <div className="grid grid-cols-12 gap-4 p-4 h-full w-full">
              {Array.from({ length: 120 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-4 w-4 rounded-sm bg-primary/10"
                  style={{ 
                    opacity: Math.random() * 0.5,
                    transform: `translate(${Math.random() * 20}px, ${Math.random() * 20}px)`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-1">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              GitHub Profile Visualizer
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              Discover insights from any GitHub profile with beautiful, interactive visualizations
            </p>

            <form onSubmit={handleSearch} className="flex w-full max-w-md mx-auto gap-2 mb-8">
              <div className="relative flex-1">
                <GithubIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter GitHub username"
                  className="pl-10 h-12"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="px-6">
                Visualize
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span>Try:</span>
              {["vercel", "facebook", "google", "microsoft"].map((name) => (
                <button
                  key={name}
                  className="hover:text-primary hover:underline transition-colors"
                  onClick={() => {
                    setUsername(name)
                    setSearchedUsername(name)
                    // Scroll to results
                    setTimeout(() => {
                      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
                    }, 100)
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {!searchedUsername && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful GitHub Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<PieChart className="h-8 w-8 text-primary" />}
                title="Language Breakdown"
                description="Visualize the distribution of programming languages across repositories"
              />
              <FeatureCard 
                icon={<Activity className="h-8 w-8 text-primary" />}
                title="Contribution Activity"
                description="Track contribution patterns with interactive heatmaps and charts"
              />
              <FeatureCard 
                icon={<Star className="h-8 w-8 text-primary" />}
                title="Repository Insights"
                description="Discover top repositories and analyze engagement metrics"
              />
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {searchedUsername && (
        <section id="results" className="py-8 flex-1">
          <div className="max-w-7xl mx-auto px-4">
            <GitHubProfileVisualizer username={searchedUsername} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            GitHub Profile Visualizer - Built with Next.js and Tailwind CSS
          </p>
          <p className="mt-2">
            Data provided by the GitHub API. This tool is not affiliated with GitHub.
          </p>
        </div>
      </footer>

      {/* Login Dialog */}
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
