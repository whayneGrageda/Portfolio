/**
 * Main Entry Point
 * Initializes the application with MVVM architecture and routing
 */

import './styles/main.css';

// Services
import { ThemeService } from '@services/ThemeService';
import { ThreeDService } from '@services/ThreeDService';
import { ScrollService } from '@services/ScrollService';
import { RouterService } from '@services/RouterService';

// Repositories
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { SkillRepository } from '@/infrastructure/repositories/SkillRepository';

// ViewModels
import { HomeViewModel } from '@viewmodels/HomeViewModel';
import { ProjectDetailViewModel } from '@viewmodels/ProjectDetailViewModel';

// Views
import { HomeView } from '@views/HomeView';
import { ProjectDetailView } from '@views/ProjectDetailView';

/**
 * Application Bootstrap
 */
class App {
  private homeView: HomeView | null = null;
  private projectDetailView: ProjectDetailView | null = null;
  private router: RouterService;
  private appContainer: HTMLElement;

  // Repositories (shared across views)
  private projectRepository: ProjectRepository;
  private skillRepository: SkillRepository;

  // Services (shared across views)
  private themeService: ThemeService;
  private threeDService: ThreeDService;
  private scrollService: ScrollService;

  constructor() {
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('App container not found');
    }
    this.appContainer = container;
    
    // Initialize shared dependencies
    this.router = new RouterService();
    this.projectRepository = new ProjectRepository();
    this.skillRepository = new SkillRepository();
    this.themeService = new ThemeService();
    this.threeDService = new ThreeDService();
    this.scrollService = new ScrollService();
  }

  async initialize(): Promise<void> {
    try {
      // Register routes
      this.router.register('/', () => this.renderHome());
      this.router.register('/projects/:id', () => this.renderProjectDetail());

      // Initial route
      const currentPath = this.router.getCurrentPath();
      if (currentPath === '/' || currentPath === '') {
        await this.renderHome();
      } else if (currentPath.startsWith('/projects/')) {
        await this.renderProjectDetail();
      } else {
        // Default to home for unknown routes
        this.router.navigate('/');
      }

      console.log('Portfolio MVVM initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.renderError();
    }
  }

  /**
   * Render home page
   */
  private async renderHome(): Promise<void> {
    // Initialize HomeViewModel
    const homeViewModel = new HomeViewModel(
      this.projectRepository,
      this.skillRepository,
      this.themeService,
      this.threeDService,
      this.scrollService
    );

    // Initialize HomeView
    this.homeView = new HomeView(this.appContainer, homeViewModel);
    this.homeView.setRouter(this.router);

    // Render
    await this.homeView.render();
  }

  /**
   * Render project detail page
   */
  private async renderProjectDetail(): Promise<void> {
    const projectId = this.router.getProjectId();
    if (!projectId) {
      this.router.navigate('/');
      return;
    }

    // Initialize ProjectDetailViewModel
    const projectDetailViewModel = new ProjectDetailViewModel(this.projectRepository);

    // Initialize ProjectDetailView
    this.projectDetailView = new ProjectDetailView(
      this.appContainer,
      projectDetailViewModel,
      this.router
    );

    // Render
    await this.projectDetailView.render(projectId);
  }

  private renderError(): void {
    this.appContainer.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
        color: #e7e1de;
      ">
        <div style="text-align: center;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">
            Failed to load portfolio
          </h1>
          <p style="color: #cec5ba;">
            Please refresh the page or contact support.
          </p>
        </div>
      </div>
    `;
  }
}

// Bootstrap application
const app = new App();
app.initialize();
