"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  type DocumentData 
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, UserProjectStats } from "@/types/project"
import { 
  Plus, 
  ExternalLink, 
  Github, 
  Users, 
  Trophy, 
  Star,
  Edit3,
  Calendar,
  Settings
} from "lucide-react"
import { Loading } from "@/components/Loading"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<UserProjectStats>({
    totalProjects: 0,
    totalVotes: 0,
    featuredProjects: 0,
    averageVotes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchUserProjects()
    }
  }, [user])

  const fetchUserProjects = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const projectsQuery = query(
        collection(db, "projects"),
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc")
      )
      
      const querySnapshot = await getDocs(projectsQuery)
      const projects: Project[] = []
      let totalVotes = 0
      let featuredCount = 0

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
        projects.push(project)
        totalVotes += project.votes
        if (project.featured) featuredCount++
      })

      setUserProjects(projects)
      setStats({
        totalProjects: projects.length,
        totalVotes,
        featuredProjects: featuredCount,
        averageVotes: projects.length > 0 ? Math.round(totalVotes / projects.length) : 0
      })
    } catch (error) {
      console.error("Error fetching user projects:", error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    <Loading/>
  }

  if (!user) {
    return null
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-20 h-20 rounded-full border-4 border-background"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full border-4 border-background flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user.displayName || user.email}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {user.bio || "Ready to showcase your next innovative project?"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                  <Users className="w-3 h-3" />
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Joined {formatDate(user.createdAt as Date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalProjects}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Plus className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalVotes}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.featuredProjects}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {user.role === "admin" && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Admin Panel</h2>
              <p className="text-muted-foreground mb-6">
                Manage projects, users, and platform settings.
              </p>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  <Settings className="w-5 h-5 mr-2" />
                  Go to Admin Panel
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
              <p className="text-muted-foreground mt-1">Projects you've created and contributed to</p>
            </div>
          </div>

          {userProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {userProjects.map((project) => (
                <div key={project.id} className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-medium">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.shortDescription}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {project.votes} votes
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.teamMembers.length} members
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(project.createdAt as Date)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/projects/edit/${project.id}`}>
                      <Button size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </Link>
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Github className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start showcasing your work by creating your first project.
              </p>
            </div>
          )}
        </div>
      </main>

    </div>
  )
}