import { IProjectRepository } from '@/domain/interfaces/IProjectRepository';
import { ISkillRepository } from '@/domain/interfaces/ISkillRepository';
import { Project } from '@models/Project';
import { SkillGroup } from '@models/Skill';
import { ThemeService } from '@services/ThemeService';
import { ThreeDService } from '@services/ThreeDService';
import { ScrollService } from '@services/ScrollService';

/**
 * ViewModel: Home Page
 * Manages home page presentation logic and state
 */
export class HomeViewModel {
  private projectRepository: IProjectRepository;
  private skillRepository: ISkillRepository;
  private themeService: ThemeService;
  private threeDService: ThreeDService;
  private scrollService: ScrollService;

  // State
  private featuredProjects: Project[] = [];
  private skillGroups: SkillGroup[] = [];
  private isLoading: boolean = true;
  private error: string | null = null;

  // Callbacks
  private onStateChange?: () => void;

  constructor(
    projectRepository: IProjectRepository,
    skillRepository: ISkillRepository,
    themeService: ThemeService,
    threeDService: ThreeDService,
    scrollService: ScrollService
  ) {
    this.projectRepository = projectRepository;
    this.skillRepository = skillRepository;
    this.themeService = themeService;
    this.threeDService = threeDService;
    this.scrollService = scrollService;
  }

  /**
   * Initialize view model
   */
  async initialize(): Promise<void> {
    try {
      this.isLoading = true;
      this.notifyChange();

      // Load data
      const [projects, skills] = await Promise.all([
        this.projectRepository.getFeatured(2),
        this.skillRepository.getGroupedByCategory()
      ]);

      this.featuredProjects = projects;
      this.skillGroups = skills;
      this.isLoading = false;
      this.error = null;

      this.notifyChange();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load data';
      this.isLoading = false;
      this.notifyChange();
    }
  }

  /**
   * Initialize 3D hero element
   */
  initialize3DHero(container: HTMLElement): void {
    this.threeDService.initialize(container);
  }

  /**
   * Initialize scroll behavior
   */
  initializeScroll(): void {
    this.scrollService.initialize('section');
  }

  /**
   * Toggle theme mode
   */
  toggleTheme(): void {
    this.themeService.toggleMode();
  }

  /**
   * Navigate to section
   */
  navigateToSection(sectionId: string): void {
    this.scrollService.scrollToId(sectionId);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: () => void): () => void {
    this.onStateChange = callback;
    return () => {
      this.onStateChange = undefined;
    };
  }

  /**
   * Get current state
   */
  getState() {
    return {
      featuredProjects: [...this.featuredProjects],
      skillGroups: [...this.skillGroups],
      isLoading: this.isLoading,
      error: this.error,
      theme: this.themeService.getTheme()
    };
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.threeDService.dispose();
    this.scrollService.dispose();
  }

  private notifyChange(): void {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}
