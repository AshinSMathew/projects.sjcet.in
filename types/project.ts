export interface TeamMember {
  id: string;
  name: string;
  email: string;
  linkedinUrl: string;
  avatar?: string;
  role: string;
  department?: string;
  year?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  demoVideoUrl?: string;
  githubUrl: string;
  liveUrl?: string;
  teamMembers: TeamMember[];
  tags: string[];
  votes: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'active' | 'archived' | 'draft';
  category: 'web' | 'mobile' | 'ai-ml' | 'iot' | 'robotics' | 'other';
  technologies: string[];
  documentationUrl?: string;
}

export interface ProjectCardProps {
  project: Project;
  className?: string;
  showVoteButton?: boolean;
  onVote?: (projectId: string) => void;
  userVoted?: boolean;
  showEditButton?: boolean;
  onEdit?: (projectId: string) => void;
}

export interface ProjectFormData {
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  demoVideoUrl?: string;
  githubUrl: string;
  liveUrl?: string;
  teamMembers: Omit<TeamMember, 'id'>[];
  tags: string[];
  category: Project['category'];
  technologies: string[];
  documentationUrl?: string;
}

export interface ProjectStats {
  totalProjects: number;
  totalVotes: number;
  featuredProjects: number;
  activeProjects: number;
  projectsThisMonth: number;
}

export interface UserProjectStats {
  totalProjects: number;
  totalVotes: number;
  featuredProjects: number;
  averageVotes: number;
}