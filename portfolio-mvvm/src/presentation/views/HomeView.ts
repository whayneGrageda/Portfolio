import { HomeViewModel } from '@viewmodels/HomeViewModel';
import { Project } from '@models/Project';
import { SkillGroup } from '@models/Skill';
import { RouterService } from '@/infrastructure/services/RouterService';
import { getTechIcon } from '@/utils/techIcons';

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
        ${this.renderExperienceSection()}
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
        
        <!-- Mobile hamburger menu -->
        <button class="nav-hamburger" aria-label="Toggle menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        
        <div class="nav-links">
          <a href="#home" class="nav-link active" data-section="home">Home</a>
          <a href="#about" class="nav-link" data-section="about">About</a>
          <a href="#experience" class="nav-link" data-section="experience">Experience</a>
          <a href="#projects" class="nav-link" data-section="projects">Projects</a>
          <a href="#skills" class="nav-link" data-section="skills">Skills</a>
          <a href="#education" class="nav-link" data-section="education">Education</a>
          <a href="#contact" class="nav-link" data-section="contact">Contact</a>
        </div>
        <a href="#contact" class="nav-contact" data-section="contact">Let's Talk</a>
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
              <p class="hero-label">FULL STACK DEVELOPER</p>
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
   * Render experience section
   */
  private renderExperienceSection(): string {
    const techStack = ['Node.js', 'TypeScript', 'RESTful APIs', 'PostgreSQL', 'Microservices', 'Kafka'];
    
    return `
      <section id="experience" class="portfolio-section experience-section">
        <div class="section-content">
          <div class="section-header animate-on-scroll fade-in-up">
            <h2 class="section-title-large">Work Experience</h2>
            <p class="section-subtitle">Professional journey and contributions</p>
          </div>
          
          <div class="experience-timeline">
            <div class="bento-card experience-card animate-on-scroll fade-in-up">
              <div class="experience-header">
                <div class="experience-title-group">
                  <h3 class="experience-title">Full Stack Developer Intern</h3>
                  <p class="experience-company">Department of Science and Technology (DOST)</p>
                  <p class="experience-department">PES-DX Division, Information Technology Department</p>
                </div>
                <span class="experience-date">December 2025 – May 2026</span>
              </div>
              
              <ul class="experience-highlights">
                <li>Developed and maintained backend services and secured REST API endpoints across multiple microservices, including setting up the full authorization backend for the system.</li>
                <li>Collaborated with the development team through version control workflows, conducted knowledge transfer sessions, and guided co-interns throughout the internship period.</li>
                <li>Wrote comprehensive technical documentation covering API details, acceptance criteria, request and response bodies, SQL queries, and unit testing guides.</li>
              </ul>
              
              <div class="experience-tech">
                ${techStack.map(tech => {
                  const icon = getTechIcon(tech);
                  return `<span class="tech-badge">${icon ? `<i class="${icon}"></i> ` : ''}${tech}</span>`;
                }).join('')}
              </div>
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
          <div class="project-card-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </div>
          <div class="project-header">
            <span class="project-category">${project.category}</span>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-subtitle">${project.subtitle}</p>
          </div>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.techStack.slice(0, 5).map(tech => {
              const icon = getTechIcon(tech);
              const html = `<span class="tech-badge">${icon ? `<i class="${icon}"></i> ` : ''}${tech}</span>`;
              console.log('Badge HTML:', html); // Debug
              return html;
            }).join('')}
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
      </svg>`,
      'Architecture': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <line x1="10" y1="6.5" x2="14" y2="6.5"/>
        <line x1="10" y1="17.5" x2="14" y2="17.5"/>
        <line x1="6.5" y1="10" x2="6.5" y2="14"/>
        <line x1="17.5" y1="10" x2="17.5" y2="14"/>
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
            <a href="#" class="contact-link" id="email-contact-link">Email</a>
            <a href="https://github.com/whayneGrageda" target="_blank" rel="noopener" class="contact-link">GitHub</a>
            <a href="https://www.linkedin.com/in/whayne-grageda-060482340" target="_blank" rel="noopener" class="contact-link">LinkedIn</a>
          </div>
        </div>
      </section>

      <!-- Contact Modal -->
      <div id="contact-modal" class="contact-modal">
        <div class="contact-modal-overlay"></div>
        <div class="contact-modal-content">
          <button class="contact-modal-close" aria-label="Close">&times;</button>
          <h2 class="contact-modal-title">Get in Touch</h2>
          <p class="contact-modal-subtitle">Fill out the form and I'll get back to you soon.</p>
          
          <form id="contact-form" class="contact-form">
            <div class="form-group">
              <label for="contact-name" class="form-label">Name</label>
              <input type="text" id="contact-name" name="name" class="form-input" required placeholder="Your name">
            </div>
            
            <div class="form-group">
              <label for="contact-email" class="form-label">Email Address</label>
              <input type="email" id="contact-email" name="email" class="form-input" required placeholder="your.email@example.com">
            </div>
            
            <div class="form-group">
              <label for="contact-subject" class="form-label">Subject</label>
              <input type="text" id="contact-subject" name="subject" class="form-input" required placeholder="What's this about?">
            </div>
            
            <div class="form-group">
              <label for="contact-message" class="form-label">Message</label>
              <textarea id="contact-message" name="message" class="form-textarea" rows="5" required placeholder="Your message..."></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary btn-full">Send Message</button>
          </form>
        </div>
      </div>
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
          
          // Close mobile menu after navigation
          this.closeMobileMenu();
        }
      });
    });

    // Mobile hamburger menu
    const hamburger = document.querySelector('.nav-hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling
        this.toggleMobileMenu();
      });
    }

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

    // Contact modal
    this.setupContactModal();
  }

  private mobileMenuBackdropHandler: ((e: MouseEvent) => void) | null = null;

  /**
   * Toggle mobile menu
   */
  private toggleMobileMenu(): void {
    const nav = document.querySelector('.portfolio-nav');
    const hamburger = document.querySelector('.nav-hamburger');
    
    if (nav && hamburger) {
      const isOpen = nav.classList.contains('mobile-open');
      
      if (isOpen) {
        // Close the menu
        this.closeMobileMenu();
      } else {
        // Open the menu
        nav.classList.add('mobile-open');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Remove old listener if exists
        if (this.mobileMenuBackdropHandler) {
          document.removeEventListener('click', this.mobileMenuBackdropHandler);
          this.mobileMenuBackdropHandler = null;
        }
        
        // Add click listener to backdrop to close menu (with delay)
        setTimeout(() => {
          this.mobileMenuBackdropHandler = (e: MouseEvent) => {
            const navLinks = document.querySelector('.nav-links');
            const target = e.target as Node;
            
            // Close if clicking outside navLinks and not the hamburger
            if (navLinks && !navLinks.contains(target) && !hamburger.contains(target)) {
              this.closeMobileMenu();
            }
          };
          
          document.addEventListener('click', this.mobileMenuBackdropHandler);
        }, 200);
      }
    }
  }

  /**
   * Close mobile menu and cleanup
   */
  private closeMobileMenu(): void {
    const nav = document.querySelector('.portfolio-nav');
    const hamburger = document.querySelector('.nav-hamburger');
    
    if (nav) {
      nav.classList.remove('mobile-open');
    }
    
    if (hamburger) {
      hamburger.classList.remove('active');
    }
    
    document.body.style.overflow = '';
    
    // Remove backdrop listener immediately
    if (this.mobileMenuBackdropHandler) {
      document.removeEventListener('click', this.mobileMenuBackdropHandler);
      this.mobileMenuBackdropHandler = null;
    }
  }

  /**
   * Setup contact modal
   */
  private setupContactModal(): void {
    const emailLink = document.getElementById('email-contact-link');
    const modal = document.getElementById('contact-modal');
    const modalClose = document.querySelector('.contact-modal-close');
    const modalOverlay = document.querySelector('.contact-modal-overlay');
    const contactForm = document.getElementById('contact-form');

    // Open modal
    if (emailLink && modal) {
      emailLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    // Close modal
    const closeModal = () => {
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', closeModal);
    }

    // Handle form submission
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm as HTMLFormElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;

        // Create Gmail compose URL
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=gragedawhayne@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`)}`;
        
        // Open Gmail in new tab
        window.open(gmailUrl, '_blank');
        
        // Close modal and reset form
        closeModal();
        (contactForm as HTMLFormElement).reset();
      });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('active')) {
        closeModal();
      }
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

    // Setup scroll spy for navigation
    this.setupScrollSpy();
  }

  /**
   * Setup scroll spy for navigation highlighting
   */
  private setupScrollSpy(): void {
    const sections = document.querySelectorAll('.portfolio-section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          
          // Update active nav link
          navLinks.forEach(link => {
            const linkSection = (link as HTMLElement).dataset.section;
            if (linkSection === sectionId) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => observer.observe(section));
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
