"use client"

import { ProjectCard } from "@/components/project-card"
import { Leaderboard } from "@/components/leaderboard"
import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, where, type DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project } from "@/types/project"
import { useAuth } from "@/lib/auth-context"
import { Loading } from "@/components/Loading"

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>(["All"])
  const { user } = useAuth()

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    // Filter projects when category changes
    if (selectedCategory === "All") {
      setFilteredProjects(projects)
    } else {
      setFilteredProjects(projects.filter((p) => p.category === selectedCategory))
    }
  }, [selectedCategory, projects])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      // Query to get all active projects, ordered by creation date (newest first)
      const projectsQuery = query(
        collection(db, "projects"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      )
      
      const querySnapshot = await getDocs(projectsQuery)
      const projectsData: Project[] = []

      querySnapshot.forEach((doc) => {
        const projectData = doc.data() as DocumentData
        const project: Project = {
          id: doc.id,
          title: projectData.title,
          description: projectData.description,
          shortDescription: projectData.shortDescription || projectData.description.substring(0, 150) + '...',
          thumbnail: projectData.thumbnail || "/placeholder-project.jpg",
          demoVideoUrl: projectData.demoVideoUrl,
          githubUrl: projectData.githubUrl,
          liveUrl: projectData.liveUrl,
          teamMembers: projectData.teamMembers || [],
          tags: projectData.tags || [],
          votes: projectData.votes || 0,
          featured: projectData.featured || false,
          createdAt: projectData.createdAt?.toDate() || new Date(),
          updatedAt: projectData.updatedAt?.toDate() || new Date(),
          createdBy: projectData.createdBy,
          status: projectData.status || 'active',
          category: projectData.category || 'other',
          technologies: projectData.technologies || []
        }
        projectsData.push(project)
      })

      setProjects(projectsData)
      
      // Extract unique categories
      const uniqueCategories = ["All", ...new Set(projectsData.map((p) => p.category))] as string[]
      setCategories(uniqueCategories)
      
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (projectId: string) => {
    if (!user) {
      // Redirect to login or show login modal
      return
    }

    try {
      // Here you would implement the voting logic
      // For now, we'll just update the local state
      setProjects(projects.map((p) => 
        p.id === projectId ? { ...p, votes: p.votes + 1 } : p
      ))
      
      // In a real implementation, you would:
      // 1. Check if user already voted
      // 2. Add vote to Firestore
      // 3. Update project votes count
      // 4. Update leaderboard
      
    } catch (error) {
      console.error("Error voting for project:", error)
    }
  }

  if (loading) {
    <Loading/>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">SJCET Project Showcase</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover {projects.length} innovative projects from our talented students. 
            {user ? " Vote for your favorite projects and support the next generation of engineers." : " Sign in to vote for your favorite projects."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Projects Grid */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {category} {category !== "All" && `(${projects.filter(p => p.category === category).length})`}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onVote={handleVote}
                    userVoted={false} // You would check this from Firestore
                    showVoteButton={!!user}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory === "All" 
                    ? "No projects have been added yet." 
                    : `No projects found in the ${selectedCategory} category.`}
                </p>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <Leaderboard/>
          </div>
        </div>
      </main>

    </div>
  )
}