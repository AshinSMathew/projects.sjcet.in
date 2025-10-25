"use client"

import { type Project } from "@/types/project"
import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, limit, where, type DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function Leaderboard() {
  const [topProjects, setTopProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState("")

  useEffect(() => {
    fetchTopProjects()
    // Set current month for display
    setMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))
  }, [])

  const fetchTopProjects = async () => {
    try {
      setLoading(true)
      
      // Query to get top 3 projects by votes, only active ones
      const projectsQuery = query(
        collection(db, "projects"),
        where("status", "==", "active"),
        orderBy("votes", "desc"),
        limit(3)
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

      setTopProjects(projectsData)
    } catch (error) {
      console.error("Error fetching leaderboard projects:", error)
      try {
        const fallbackQuery = query(
          collection(db, "projects"),
          where("status", "==", "active"),
          limit(3)
        )
        const fallbackSnapshot = await getDocs(fallbackQuery)
        const fallbackData: Project[] = []

        fallbackSnapshot.forEach((doc) => {
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
          fallbackData.push(project)
        })

        // Sort manually by votes
        const sorted = fallbackData.sort((a, b) => b.votes - a.votes).slice(0, 3)
        setTopProjects(sorted)
      } catch (fallbackError) {
        console.error("Error with fallback query:", fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return "🥇"
      case 1: return "🥈"
      case 2: return "🥉"
      default: return `${index + 1}`
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950"
      case 1: return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800"
      case 2: return "bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900"
      default: return "bg-primary text-primary-foreground"
    }
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-card-foreground">Monthly Leaderboard</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 pb-4 border-b border-border last:border-b-0">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
              <div className="text-right">
                <div className="h-6 bg-muted rounded animate-pulse w-8"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-12 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-card-foreground">Top Projects</h2>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
          {month}
        </span>
      </div>
      
      {topProjects.length > 0 ? (
        <div className="space-y-4">
          {topProjects.map((project, index) => (
            <div 
              key={project.id} 
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${getRankColor(index)}`}>
                {getRankIcon(index)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground capitalize">{project.category}</span>
                  {project.featured && (
                    <span className="text-xs bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-primary">{project.votes}</p>
                <p className="text-xs text-muted-foreground">votes</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground text-sm">
            Be the first to add a project and get on the leaderboard!
          </p>
        </div>
      )}
      
      {/* View All Link */}
      {topProjects.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <a 
            href="/" 
            className="text-sm text-primary hover:underline font-medium flex items-center justify-center gap-1"
          >
            View All Projects
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}