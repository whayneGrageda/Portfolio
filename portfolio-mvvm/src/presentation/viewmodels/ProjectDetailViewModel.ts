import { Project } from '@models/Project';
import { IProjectRepository } from '@/domain/interfaces/IProjectRepository';

/**
 * ViewModel: Project Detail
 * Manages state and logic for project detail page
 */
export class ProjectDetailViewModel {
  private projectRepository: IProjectRepository;
  private project: Project | null = null;

  constructor(projectRepository: IProjectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * Load project by ID
   */
  async loadProject(projectId: string): Promise<void> {
    this.project = await this.projectRepository.getById(projectId);
  }

  /**
   * Get current project
   */
  getProject(): Project | null {
    return this.project;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.project = null;
  }
}
