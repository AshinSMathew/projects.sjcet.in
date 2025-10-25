import type { Project } from "./project";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'student' | 'admin';
  bio?: string;
  createdAt: Date;
  updatedAt?: Date;
  department?: string;
  year?: string;
  phone?: string;
}

export interface UserStats {
  totalProjects: number;
  totalVotes: number;
  featuredProjects: number;
  averageVotes: number;
  rank?: number;
}

export interface UserDashboardData {
  user: User;
  projects: Project[];
  stats: UserStats;
}