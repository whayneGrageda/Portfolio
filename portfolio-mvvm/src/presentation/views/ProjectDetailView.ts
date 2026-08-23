import { ProjectDetailViewModel } from '@viewmodels/ProjectDetailViewModel';
import { Project } from '@models/Project';
import { RouterService } from '@/infrastructure/services/RouterService';

/**
 * View: Project Detail Page
 * Renders individual project detail pages
 */
export class ProjectDetailView {
  private viewModel: ProjectDetailViewModel;
  private container: HTMLElement;
  private router: RouterService;

  constructor(container: HTMLElement, viewModel: ProjectDetailViewModel, router: RouterService) {
    this.container = container;
    this.viewModel = viewModel;
    this.router = router;
  }

  /**
   * Render project detail page
   */
  async render(projectId: string): Promise<void> {
    await this.viewModel.loadProject(projectId);
    const project = this.viewModel.getProject();

    if (!project) {
      this.renderNotFound();
      return;
    }

    this.container.innerHTML = this.renderPage(project);
    this.attachEventListeners();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Render complete project detail page
   */
  private renderPage(project: Project): string {
    return `
      <main class="project-detail-main">
        <!-- Back Button Area -->
        <div class="project-detail-back">
          <a href="#" class="back-link" id="back-button">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Work</span>
          </a>
        </div>

        <!-- Project Hero Header -->
        <header class="project-detail-header">
          <span class="project-number">${project.id === 'facetrack' ? 'Project 02' : 'Project 01'}</span>
          <h1 class="project-hero-title">${project.fullTitle || project.title}</h1>
        </header>

        ${project.heroImage ? `
        <!-- Hero Image -->
        <div class="project-hero-image grain-overlay">
          <img src="${project.heroImage}" alt="${project.title}" class="hero-img" />
        </div>
        ` : ''}

        <!-- Bento Grid Layout -->
        <div class="project-bento-grid">
          <!-- Overview Card -->
          <div class="bento-card overview-card grain-overlay">
            <h2 class="bento-card-title">Overview</h2>
            <p class="bento-card-text-lg">${project.description}</p>
          </div>

          <!-- Tech Stack Card -->
          <div class="bento-card tech-card grain-overlay">
            <h2 class="bento-card-title">Tech Stack</h2>
            <ul class="tech-list">
              ${project.techStack.map(tech => `<li class="tech-list-item">${tech}</li>`).join('')}
            </ul>
          </div>

          ${project.challenge ? `
          <!-- Challenge Card -->
          <div class="bento-card challenge-card grain-overlay">
            <h3 class="bento-card-subtitle">The Challenge</h3>
            <p class="bento-card-text">${project.challenge}</p>
          </div>
          ` : ''}

          ${project.solution ? `
          <!-- Solution Card -->
          <div class="bento-card solution-card grain-overlay">
            <h3 class="bento-card-subtitle">The Solution</h3>
            <p class="bento-card-text">${project.solution}</p>
          </div>
          ` : ''}
        </div>

        <!-- CTA Section -->
        <section class="project-cta-section">
          ${project.githubUrl ? `
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="cta-button">
            <span>View Project Repository</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
          ` : `
          <a href="#" class="cta-button" id="back-to-projects">
            <span>View All Projects</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
          `}
        </section>
      </main>
    `;
  }

  /**
   * Render 404 not found
   */
  private renderNotFound(): void {
    this.container.innerHTML = `
      <div class="project-not-found">
        <h1>Project Not Found</h1>
        <p>The project you're looking for doesn't exist.</p>
        <button class="btn btn-primary" id="back-home">Back to Home</button>
      </div>
    `;
    
    const backButton = document.getElementById('back-home');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.router.navigate('/');
      });
    }
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Back button
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.router.navigate('/');
        // Scroll to projects section
        setTimeout(() => {
          const projectsSection = document.getElementById('projects');
          if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
    }

    // Back to projects button
    const backToProjects = document.getElementById('back-to-projects');
    if (backToProjects) {
      backToProjects.addEventListener('click', () => {
        this.router.navigate('/');
        // Scroll to projects section
        setTimeout(() => {
          const projectsSection = document.getElementById('projects');
          if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
    }

    // Setup scroll animations
    this.setupScrollAnimations();
  }

  /**
   * Setup scroll animations
   */
  private setupScrollAnimations(): void {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.viewModel.dispose();
  }
}
