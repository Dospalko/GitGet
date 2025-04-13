"use client"

import type React from "react"

import { useState } from "react"
import { GitHubProfileVisualizer } from "@/components/github-profile-visualizer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GithubIcon } from "lucide-react"

export default function Home() {
  const [username, setUsername] = useState("")
  const [searchedUsername, setSearchedUsername] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setSearchedUsername(username)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">GitHub Profile Visualizer</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl">
            Enter a GitHub username to visualize their profile, repositories, and activity.
          </p>

          <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2 mb-8">
            <div className="relative flex-1">
              <GithubIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="GitHub username"
                className="pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <Button type="submit">Visualize</Button>
          </form>
        </div>

        {searchedUsername && <GitHubProfileVisualizer username={searchedUsername} />}
      </div>
    </main>
  )
}
