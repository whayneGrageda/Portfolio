import { HomeViewModel } from '@viewmodels/HomeViewModel';
import { Project } from '@models/Project';
import { SkillGroup } from '@models/Skill';
import { RouterService } from '@/infrastructure/services/RouterService';

/**
 * View: Home Page
 * Renders home page UI and handles user interactions
 */
export class HomeView {
  private viewModel: HomeViewModel;
  private container: HTMLElement;
  private router: RouterService | null = null;

  constructor(container: HTMLElement, viewModel: HomeViewModel) {
    this.container = container;
    this.viewModel = viewModel;
  }

  /**
   * Set router instance
   */
  setRouter(router: RouterService): void {
    this.router = router;
  }

  /**
   * Render the view
   */
  async render(): Promise<void> {
    // Subscribe to state changes
    this.viewModel.subscribe(() => this.update());

    // Initialize data
    await this.viewModel.initialize();

    // Initial render
    this.update();

    // Initialize 3D and scroll after DOM is ready
    requestAnimationFrame(() => {
      this.initialize3D();
      this.viewModel.initializeScroll();
    });
  }

  /**
   * Update view based on current state
   */
  private update(): void {
    const state = this.viewModel.getState();

    if (state.isLoading) {
      this.renderLoading();
      return;
    }

    if (state.error) {
      this.renderError(state.error);
      return;
    }

    this.renderContent(state.featuredProjects, state.skillGroups);
  }

  /**
   * Initialize 3D hero
   */
  private initialize3D(): void {
    const heroCanvas = document.getElementById('hero-3d-canvas');
    if (heroCanvas) {
      this.viewModel.initialize3DHero(heroCanvas);
    }
  }

  /**
   * Render loading state
   */
  private renderLoading(): void {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="animate-pulse text-primary font-label-caps tracking-widest">
          LOADING...
        </div>
      </div>
    `;
  }

  /**
   * Render error state
   */
  private renderError(error: string): void {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-error font-body-md">
          Error: ${error}
        </div>
      </div>
    `;
  }

  /**
   * Render main content
   */
  private renderContent(projects: Project[], skillGroups: SkillGroup[]): void {
    this.container.innerHTML = `
      ${this.renderNavigation()}
      <main class="portfolio-main">
        ${this.renderHeroSection()}
        ${this.renderAboutSection()}
        ${this.renderProjectsSection(projects)}
        ${this.renderSkillsSection(skillGroups)}
        ${this.renderEducationSection()}
        ${this.renderContactSection()}
      </main>
      ${this.renderFooter()}
    `;

    this.attachEventListeners();
  }

  /**
   * Render navigation
   */
  private renderNavigation(): string {
    return `
      <nav class="portfolio-nav">
        <div class="nav-logo">PORTFOLIO</div>
        <div class="nav-links">
          <a href="#home" class="nav-link active" data-section="home">Home</a>
          <a href="#about" class="nav-link" data-section="about">About</a>
          <a href="#projects" class="nav-link" data-section="projects">Projects</a>
          <a href="#skills" class="nav-link" data-section="skills">Skills</a>
          <a href="#education" class="nav-link" data-section="education">Education</a>
          <a href="#contact" class="nav-link" data-section="contact">Contact</a>
        </div>
        <a href="#contact" class="nav-contact" data-section="contact">Contact Me</a>
      </nav>
    `;
  }

  /**
   * Render hero section with background image
   */
  private renderHeroSection(): string {
    return `
      <section id="home" class="portfolio-section hero-section">
        <div class="hero-grid">
          <div class="hero-content animate-on-scroll fade-in-up">
            <div class="space-y-4">
              <p class="hero-label">SOFTWARE ENGINEER & IT SPECIALIST</p>
              <h1 class="hero-title">Architecting robust digital solutions with precision and elegance.</h1>
            </div>
            <p class="hero-description">
              Bridging the gap between complex backend systems and intuitive user experiences. 
              Specializing in high-performance web applications, scalable architectures, and modern UI/UX implementation.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary" data-section="projects">View Projects</button>
              <button class="btn btn-ghost" data-section="contact">Contact Me</button>
            </div>
            <div class="hero-badges">
              <img src="/images/ITS-Badges_HTML-and-CSS_1200px.png" alt="HTML & CSS Certification" class="badge-img" />
              <img src="/images/ITS-Badges-Cybersecurity.png" alt="Cybersecurity Certification" class="badge-img" />
              <img src="/images/PMI.png" alt="PMI Certification" class="badge-img" />
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render about section
   */
  private renderAboutSection(): string {
    return `
      <section id="about" class="portfolio-section about-section">
        <div class="section-content">
          <div class="bento-grid">
            <div class="bento-card bento-large animate-on-scroll fade-in-up">
              <h2 class="section-title">Who I Am</h2>
              <p class="section-text">
                I'm a full-stack developer working mainly in TypeScript and Node.js, with a focus on distributed backend systems — Kafka-driven microservice architectures, service-to-service communication, and the kind of structural discipline enterprise codebases demand. I care as much about how a system is designed as whether it runs: clean architecture, maintainable services, and documentation that doesn't get abandoned.
              </p>
              <p class="section-text">
                My capstone project, FACETRACK, is an AI-driven facial recognition attendance and security system built on ArcFace with anti-spoofing — a good example of how I like to pair applied ML with solid engineering fundamentals underneath.
              </p>
              <blockquote class="quote">
                "Engineering is an art form constrained by logic."
              </blockquote>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render projects section
   */
  private renderProjectsSection(projects: Project[]): string {
    const projectCards = projects
      .map(
        (project, index) => `
        <div class="bento-card project-card animate-on-scroll fade-in-up" style="animation-delay: ${index * 0.1}s;" data-project-id="${project.id}">
          <div class="project-header">
            <span class="project-category">${project.category}</span>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-subtitle">${project.subtitle}</p>
          </div>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.techStack.slice(0, 5).map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
          </div>
        </div>
      `
      )
      .join('');

    return `
      <section id="projects" class="portfolio-section projects-section">
        <div class="section-content">
          <div class="section-header animate-on-scroll fade-in-up">
            <h2 class="section-title-large">Featured Projects</h2>
            <p class="section-subtitle">Selected work showcasing technical expertise</p>
          </div>
          <div class="bento-grid">
            ${projectCards}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render skills section
   */
  private renderSkillsSection(skillGroups: SkillGroup[]): string {
    const icons: { [key: string]: string } = {
      'Frontend': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>`,
      'Backend': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/>
        <line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>`,
      'Infrastructure': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>`
    };

    const skillCards = skillGroups
      .map(
        (group, index) => `
        <div class="bento-card skill-card animate-on-scroll fade-in-up" style="animation-delay: ${index * 0.15}s;">
          <div class="skill-icon">${icons[group.category] || ''}</div>
          <h3 class="skill-category">${group.category}</h3>
          <ul class="skill-list">
            ${group.skills.map(skill => `<li class="skill-item">${skill.name}</li>`).join('')}
          </ul>
        </div>
      `
      )
      .join('');

    return `
      <section id="skills" class="portfolio-section skills-section">
        <div class="section-content">
          <div class="section-header animate-on-scroll fade-in-up">
            <h2 class="section-title-large">Technical Proficiency</h2>
            <p class="section-subtitle">The tools and languages I use to build</p>
          </div>
          <div class="skills-grid">
            ${skillCards}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render education section
   */
  private renderEducationSection(): string {
    return `
      <section id="education" class="portfolio-section education-section">
        <div class="section-content">
          <div class="section-header animate-on-scroll fade-in-up">
            <h2 class="section-title-large">Education & Certifications</h2>
            <p class="section-subtitle">Academic background and professional credentials</p>
          </div>
          
          <div class="bento-grid education-grid">
            <!-- Education Card -->
            <div class="bento-card education-card animate-on-scroll fade-in-up">
              <div class="education-header">
                <span class="education-label">DEGREE</span>
                <h3 class="education-title">National University</h3>
                <p class="education-subtitle">Dasmariñas, Cavite</p>
              </div>
              <div class="education-details">
                <p class="education-degree">Bachelor of Science in Information Technology</p>
                <p class="education-date">Graduated: August 2026</p>
              </div>
            </div>

            <!-- Certifications Card -->
            <div class="bento-card certifications-card animate-on-scroll fade-in-up" style="animation-delay: 0.1s;">
              <div class="certification-header">
                <span class="education-label">CERTIFICATIONS</span>
                <h3 class="education-title">Industry Certifications</h3>
              </div>
              <div class="certifications-list">
                <a href="https://www.credly.com/badges/a94623ba-553f-4160-90b8-5f1e4f94427c" 
                   target="_blank" 
                   rel="noopener" 
                   class="certification-item">
                  <div class="cert-icon-wrapper">
                    <svg class="cert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/>
                    </svg>
                  </div>
                  <div class="cert-info">
                    <span class="cert-name">IT Specialist - Cybersecurity</span>
                    <span class="cert-link">View Credential</span>
                  </div>
                </a>
                
                <a href="https://www.credly.com/badges/d34b9734-7d4e-4e74-95e8-20c2e6653397" 
                   target="_blank" 
                   rel="noopener" 
                   class="certification-item">
                  <div class="cert-icon-wrapper">
                    <svg class="cert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/>
                    </svg>
                  </div>
                  <div class="cert-info">
                    <span class="cert-name">PMI Project Management Ready™</span>
                    <span class="cert-link">View Credential</span>
                  </div>
                </a>
                
                <a href="https://www.credly.com/badges/23c9f448-d0ee-4870-96a9-388b39506108" 
                   target="_blank" 
                   rel="noopener" 
                   class="certification-item">
                  <div class="cert-icon-wrapper">
                    <svg class="cert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/>
                    </svg>
                  </div>
                  <div class="cert-info">
                    <span class="cert-name">IT Specialist - HTML and CSS</span>
                    <span class="cert-link">View Credential</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render contact section
   */
  private renderContactSection(): string {
    return `
      <section id="contact" class="portfolio-section contact-section">
        <div class="section-content">
          <h2 class="section-title-large">Let's build something enduring.</h2>
          <p class="section-subtitle">
            Available for freelance opportunities and select consulting engagements.
          </p>
          <div class="contact-links">
            <a href="mailto:gragedawhayne@gmail.com" class="contact-link">Email</a>
            <a href="https://github.com/whayneGrageda" target="_blank" rel="noopener" class="contact-link">GitHub</a>
            <a href="https://www.linkedin.com/in/whayne-grageda-060482340" target="_blank" rel="noopener" class="contact-link">LinkedIn</a>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render footer
   */
  private renderFooter(): string {
    return `
      <footer class="portfolio-footer">
        <div class="footer-content">
          <div class="footer-main">
            <h2 class="footer-title">Whayne Grageda</h2>
            <p class="footer-text">
              Full-stack developer specializing in distributed systems, TypeScript, and modern web architectures.
            </p>
            <p class="footer-copyright">
              © 2026 Whayne Grageda. All rights reserved.
            </p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <span class="footer-label">Connect</span>
              <a href="https://www.linkedin.com/in/whayne-grageda-060482340" target="_blank" rel="noopener" class="footer-link">LinkedIn</a>
              <a href="https://github.com/whayneGrageda" target="_blank" rel="noopener" class="footer-link">GitHub</a>
              <a href="mailto:gragedawhayne@gmail.com" class="footer-link">Email</a>
            </div>
            <div class="footer-column">
              <span class="footer-label">Legal</span>
              <a href="#" class="footer-link">Privacy Policy</a>
              <a href="#" class="footer-link">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Navigation links
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = (e.currentTarget as HTMLElement).dataset.section;
        if (section) {
          this.viewModel.navigateToSection(section);
          this.updateActiveNav(section);
        }
      });
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.viewModel.toggleTheme();
      });
    }

    // Setup scroll animations
    this.setupScrollAnimations();

    // Project card clicks
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const projectId = (card as HTMLElement).dataset.projectId;
        if (projectId && this.router) {
          this.router.navigate(`/projects/${projectId}`);
        }
      });
    });
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

    // Observe all elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
  }

  /**
   * Update active navigation link
   */
  private updateActiveNav(activeSection: string): void {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const section = (link as HTMLElement).dataset.section;
      if (section === activeSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.viewModel.dispose();
  }
}
