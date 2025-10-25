"use client"

import type { Project } from "@/types/project"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ExternalLink, Github, Users, Star } from "lucide-react"

interface ProjectCardProps {
  project: Project
  onVote?: (projectId: string) => void
  userVoted?: boolean
  showVoteButton?: boolean
}

export function ProjectCard({ project, onVote, userVoted = false, showVoteButton = true }: ProjectCardProps) {
  const { user } = useAuth()
  const [votes, setVotes] = useState(project.votes)
  const [hasVoted, setHasVoted] = useState(userVoted)

  const handleVote = () => {
    if (!user) {
      alert("Please login to vote")
      return
    }
    if (!hasVoted) {
      setVotes(votes + 1)
      setHasVoted(true)
      onVote?.(project.id)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short'
    }).format(date)
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Project Thumbnail */}
      <div className="relative h-48 bg-muted">
        <Image 
          src={project.thumbnail || "/placeholder-project.jpg"} 
          alt={project.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        {project.featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500 text-yellow-950 text-xs font-medium">
              <Star className="w-3 h-3" />
              Featured
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
            {project.category.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
        </div>

        {/* Project Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {project.shortDescription || project.description}
        </p>

        {/* Team Members */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">Team</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {project.teamMembers.slice(0, 3).map((member, idx) => (
              <span 
                key={idx} 
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md truncate max-w-24"
                title={member.name}
              >
                {member.name}
              </span>
            ))}
            {project.teamMembers.length > 3 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                +{project.teamMembers.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Technologies</p>
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 3).map((tech, idx) => (
                <span 
                  key={idx} 
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Tags</p>
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-md">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Project Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>{formatDate(project.createdAt as Date)}</span>
          <span>{votes} votes</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          {/* Vote Button */}
          {showVoteButton && (
            <Button 
              onClick={handleVote} 
              disabled={hasVoted || !user}
              variant={hasVoted ? "secondary" : "default"} 
              size="sm"
              className="flex-1"
            >
              {hasVoted ? "✓ Voted" : user ? "Vote" : "Login to Vote"} 
            </Button>
          )}
          
          {/* Project Links */}
          <div className="flex gap-1">
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-border rounded-md hover:bg-secondary transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
            {project.liveUrl && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-border rounded-md hover:bg-secondary transition-colors"
                title="Live Demo"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
            {project.demoVideoUrl && (
              <a 
                href={project.demoVideoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-border rounded-md hover:bg-secondary transition-colors"
                title="Demo Video"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-4 pt-4 border-t border-border">
          <a 
            href={`/projects/${project.id}`}
            className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
          >
            View Project Details
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}