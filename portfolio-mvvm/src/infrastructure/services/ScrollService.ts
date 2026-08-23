/**
 * Service: Scroll Management
 * Handles smooth scrolling and navigation
 */
export class ScrollService {
  private sections: HTMLElement[] = [];

  /**
   * Initialize scroll service with section elements
   */
  initialize(sectionSelector: string = 'section'): void {
    this.sections = Array.from(document.querySelectorAll(sectionSelector));
    
    // Enable normal smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  /**
   * Navigate to specific section by index
   */
  scrollToSection(index: number): void {
    if (index < 0 || index >= this.sections.length) return;
    this.performScroll(this.sections[index]);
  }

  /**
   * Navigate to section by ID
   */
  scrollToId(id: string): void {
    const section = document.getElementById(id);
    if (section) {
      this.performScroll(section);
    }
  }

  /**
   * Get current section index
   */
  getCurrentSection(): number {
    // Calculate which section is currently in view
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i];
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        return i;
      }
    }
    
    return 0;
  }

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    document.documentElement.style.scrollBehavior = 'auto';
  }

  private performScroll(section: HTMLElement): void {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}
