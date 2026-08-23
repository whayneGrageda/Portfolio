/**
 * Domain Model: Project
 * Represents a portfolio project entity
 */
export interface Project {
  id: string;
  title: string;
  fullTitle?: string;
  subtitle: string;
  description: string;
  category: ProjectCategory;
  techStack: string[];
  features: string[];
  challenge?: string;
  solution?: string;
  result?: string;
  heroImage?: string;
  gallery?: string[];
  githubUrl?: string;
  liveUrl?: string;
  year: number;
  order: number;
}

export enum ProjectCategory {
  AI_ML = 'AI/ML',
  WEB_DEVELOPMENT = 'Web Development',
  GAME_WEB_DEV = 'Game and Web Development',
  VR_AR = 'VR/AR',
  MOBILE = 'Mobile',
  INFRASTRUCTURE = 'Infrastructure',
  OTHER = 'Other'
}

export const createProject = (data: Partial<Project>): Project => {
  return {
    id: data.id || '',
    title: data.title || '',
    fullTitle: data.fullTitle,
    subtitle: data.subtitle || '',
    description: data.description || '',
    category: data.category || ProjectCategory.OTHER,
    techStack: data.techStack || [],
    features: data.features || [],
    challenge: data.challenge,
    solution: data.solution,
    result: data.result,
    heroImage: data.heroImage,
    gallery: data.gallery,
    githubUrl: data.githubUrl,
    liveUrl: data.liveUrl,
    year: data.year || new Date().getFullYear(),
    order: data.order || 0
  };
};
