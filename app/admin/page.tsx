"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  type DocumentData 
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, ProjectFormData } from "@/types/project"
import type { TeamMember } from "@/types/project"
import { Loading } from "@/components/Loading"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    demoVideoUrl: "",
    githubUrl: "",
    liveUrl: "",
    teamMembers: [],
    tags: [],
    category: "web",
    technologies: [],
    documentationUrl: ""
  })
  const [newTeamMember, setNewTeamMember] = useState<Omit<TeamMember, 'id'>>({
    name: "",
    email: "",
    linkedinUrl: "",
    role: "",
    department: "",
    year: ""
  })
  const PROJECT_CATEGORIES = ['web', 'mobile', 'ai-ml', 'iot', 'robotics', 'other'] as const

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, "projects"))
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
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const projectData = {
        ...formData,
        votes: 0,
        featured: false,
        status: 'active' as const,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, "projects"), projectData)
      
      // Reset form and refresh projects
      setFormData({
        title: "",
        description: "",
        shortDescription: "",
        thumbnail: "",
        demoVideoUrl: "",
        githubUrl: "",
        liveUrl: "",
        teamMembers: [],
        tags: [],
        category: "web",
        technologies: [],
        documentationUrl: ""
      })
      setShowForm(false)
      fetchProjects() // Refresh the list
      
      alert("Project added successfully!")
    } catch (error) {
      console.error("Error adding project:", error)
      alert("Error adding project. Please try again.")
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      await deleteDoc(doc(db, "projects", id))
      setProjects(projects.filter(project => project.id !== id))
      alert("Project deleted successfully!")
    } catch (error) {
      console.error("Error deleting project:", error)
      alert("Error deleting project. Please try again.")
    }
  }

  const handleToggleFeatured = async (project: Project) => {
    try {
      await updateDoc(doc(db, "projects", project.id), {
        featured: !project.featured,
        updatedAt: serverTimestamp()
      })
      fetchProjects() // Refresh to get updated data
    } catch (error) {
      console.error("Error updating project:", error)
      alert("Error updating project. Please try again.")
    }
  }

  const addTeamMember = () => {
    if (newTeamMember.name && newTeamMember.email && newTeamMember.role) {
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, { ...newTeamMember }]
      })
      setNewTeamMember({
        name: "",
        email: "",
        linkedinUrl: "",
        role: "",
        department: "",
        year: ""
      })
    }
  }

  const removeTeamMember = (index: number) => {
    const updatedTeamMembers = [...formData.teamMembers]
    updatedTeamMembers.splice(index, 1)
    setFormData({ ...formData, teamMembers: updatedTeamMembers })
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const addTechnology = (tech: string) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData({ ...formData, technologies: [...formData.technologies, tech] })
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData({ ...formData, technologies: formData.technologies.filter(t => t !== tech) })
  }

  if (isLoading || loading) {
    <Loading/>
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage projects and platform content</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Project"}
          </Button>
        </div>

        {/* Add Project Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Add New Project</h2>
            <form onSubmit={handleAddProject} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Project['category'] })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {PROJECT_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Short Description *</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="Brief description (max 150 characters)"
                  maxLength={150}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.shortDescription.length}/150 characters</p>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">GitHub URL *</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://github.com/username/repo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Live URL</label>
                  <input
                    type="url"
                    value={formData.liveUrl || ""}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://your-project.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Thumbnail URL *</label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Demo Video URL</label>
                  <input
                    type="url"
                    value={formData.demoVideoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Team Members *</label>
                <div className="space-y-3 mb-3">
                  {formData.teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1 text-sm">
                        {member.name} ({member.role}) - {member.email}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    className="px-3 py-2 border border-input rounded bg-background text-foreground"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newTeamMember.email}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                    className="px-3 py-2 border border-input rounded bg-background text-foreground"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Role"
                    value={newTeamMember.role}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                    className="px-3 py-2 border border-input rounded bg-background text-foreground"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={newTeamMember.linkedinUrl}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, linkedinUrl: e.target.value })}
                    className="px-3 py-2 border border-input rounded bg-background text-foreground"
                  />
                  <Button type="button" onClick={addTeamMember} disabled={!newTeamMember.name || !newTeamMember.email || !newTeamMember.role}>
                    Add Member
                  </Button>
                </div>
              </div>

              {/* Technologies & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Technologies</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {formData.technologies.map((tech, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">
                        {tech}
                        <button type="button" onClick={() => removeTechnology(tech)} className="hover:text-destructive">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add technology and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTechnology((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                    className="w-full px-3 py-2 border border-input rounded bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-sm">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                    className="w-full px-3 py-2 border border-input rounded bg-background text-foreground"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Add Project
              </Button>
            </form>
          </div>
        )}

        {/* Projects Management */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-card-foreground mb-6">
            All Projects ({projects.length})
          </h2>
          
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No projects found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-card-foreground">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-card-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-card-foreground">Votes</th>
                    <th className="text-left py-3 px-4 font-semibold text-card-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-card-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-card-foreground">
                        <div className="flex items-center gap-2">
                          {project.title}
                          {project.featured && (
                            <span className="px-2 py-1 bg-yellow-500 text-yellow-950 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground capitalize">{project.category}</td>
                      <td className="py-3 px-4 text-primary font-semibold">{project.votes}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === 'active' 
                            ? 'bg-green-500/10 text-green-600' 
                            : project.status === 'draft'
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : 'bg-gray-500/10 text-gray-600'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleFeatured(project)}
                          >
                            {project.featured ? "Unfeature" : "Feature"}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}