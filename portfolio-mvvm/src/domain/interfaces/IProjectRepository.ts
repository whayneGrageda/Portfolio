import { Project } from '@models/Project';

/**
 * Repository Interface: Project
 * Defines contract for project data access
 */
export interface IProjectRepository {
  /**
   * Get all projects
   */
  getAll(): Promise<Project[]>;
  
  /**
   * Get project by ID
   */
  getById(id: string): Promise<Project | null>;
  
  /**
   * Get projects by category
   */
  getByCategory(category: string): Promise<Project[]>;
  
  /**
   * Get featured projects
   */
  getFeatured(limit?: number): Promise<Project[]>;
}
