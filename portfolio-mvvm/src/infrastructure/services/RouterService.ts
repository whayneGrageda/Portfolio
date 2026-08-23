/**
 * Service: Router
 * Handles client-side routing for single-page navigation
 */
export class RouterService {
  private routes: Map<string, () => void>;
  private currentPath: string;

  constructor() {
    this.routes = new Map();
    this.currentPath = window.location.pathname;
    this.initializeRouting();
  }

  /**
   * Initialize browser history API routing
   */
  private initializeRouting(): void {
    // Handle back/forward browser buttons
    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.handleRoute(this.currentPath);
    });
  }

  /**
   * Register a route with its handler
   */
  public register(path: string, handler: () => void): void {
    this.routes.set(path, handler);
  }

  /**
   * Navigate to a path
   */
  public navigate(path: string): void {
    if (this.currentPath === path) return;

    this.currentPath = path;
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }

  /**
   * Handle route based on path
   */
  private handleRoute(path: string): void {
    // Check for exact match
    if (this.routes.has(path)) {
      const handler = this.routes.get(path);
      if (handler) handler();
      return;
    }

    // Check for project detail route pattern: /projects/:id
    const projectMatch = path.match(/^\/projects\/([a-z-]+)$/);
    if (projectMatch) {
      const projectHandler = this.routes.get('/projects/:id');
      if (projectHandler) {
        projectHandler();
        return;
      }
    }

    // Default to home
    const homeHandler = this.routes.get('/');
    if (homeHandler) homeHandler();
  }

  /**
   * Get current path
   */
  public getCurrentPath(): string {
    return this.currentPath;
  }

  /**
   * Get project ID from current path
   */
  public getProjectId(): string | null {
    const match = this.currentPath.match(/^\/projects\/([a-z-]+)$/);
    return match ? match[1] : null;
  }

  /**
   * Navigate back in history
   */
  public goBack(): void {
    window.history.back();
  }
}
