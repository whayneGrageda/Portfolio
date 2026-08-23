import { IProjectRepository } from '@/domain/interfaces/IProjectRepository';
import { Project, ProjectCategory, createProject } from '@models/Project';

/**
 * Repository Implementation: Project
 * Manages project data access
 */
export class ProjectRepository implements IProjectRepository {
  private projects: Project[];

  constructor() {
    this.projects = this.initializeProjects();
  }

  async getAll(): Promise<Project[]> {
    return Promise.resolve([...this.projects]);
  }

  async getById(id: string): Promise<Project | null> {
    const project = this.projects.find(p => p.id === id);
    return Promise.resolve(project || null);
  }

  async getByCategory(category: string): Promise<Project[]> {
    const filtered = this.projects.filter(p => p.category === category);
    return Promise.resolve(filtered);
  }

  async getFeatured(limit: number = 3): Promise<Project[]> {
    const sorted = [...this.projects].sort((a, b) => a.order - b.order);
    return Promise.resolve(sorted.slice(0, limit));
  }

  private initializeProjects(): Project[] {
    return [
      createProject({
        id: 'facetrack',
        title: 'FaceTrack',
        fullTitle: 'FaceTrack: Intelligent DeepFace-Driven Attendance and Security Monitoring System',
        subtitle: 'Facial Recognition Attendance System',
        description: 'A high-performance, automated attendance tracking system leveraging state-of-the-art deep learning models for facial recognition. The system features a dual-camera setup for simultaneous Time-In and Time-Out logging, paired with a comprehensive React-based administrative dashboard.',
        category: ProjectCategory.AI_ML,
        techStack: [
          'Python',
          'TypeScript',
          'Node.js',
          'React',
          'PostgreSQL',
          'InsightFace',
          'FAISS',
          'OpenCV',
          'PyTorch',
          'Express.js'
        ],
        features: [
          'Dual-Camera Processing for simultaneous streams',
          'State-of-the-Art AI powered by InsightFace',
          'FAISS-Accelerated Search (10-100x faster)',
          'Confidence-Weighted Temporal Voting',
          'Distance-Based Anti-Spoofing',
          'Real-Time Notifications',
          'Role-Based Dashboards',
          'Hardware Acceleration (CUDA support)'
        ],
        challenge: 'Traditional attendance and access control mechanisms rely heavily on physical tokens or manual entry, introducing vulnerabilities such as token sharing (buddy punching) and administrative overhead. The challenge was to architect a frictionless, touchless system capable of processing video streams in real-time without requiring specialized, high-cost hardware at endpoints.',
        solution: 'Implementation of a multi-stage pipeline utilizing SCRFD for detection and ArcFace/MobileFaceNet for recognition. By mapping faces to a high-dimensional vector space, the system calculates similarity using FAISS indexed search to determine identity against a pre-registered database, triggering automated attendance logging in under 400 milliseconds.',
        result: 'Achieved 25-29 FPS dual-camera processing with 60-85% average confidence. The system reduced false positives by 90% through temporal voting and eliminated memory crashes through architectural optimization. Processing speed improved by 2x compared to legacy models.',
        heroImage: '/images/FaceTrackSample.png',
        githubUrl: 'https://github.com/whayneGrageda/Facial_Recognition_Capstone',
        year: 2026,
        order: 1
      }),
      createProject({
        id: 'nuquest',
        title: 'NUQuest',
        fullTitle: 'NU Quest: Nationalian Vision You Can See',
        subtitle: 'VR Educational Game & Web Portal',
        description: 'A comprehensive VR educational game built with Unity and C# featuring immersive gameplay, real-time progress tracking, and a full-stack web portal for analytics. Combines game development expertise with modern web technologies for seamless data synchronization.',
        category: ProjectCategory.GAME_WEB_DEV,
        techStack: [
          'C#',
          'Unity',
          'TypeScript',
          'React',
          'Node.js',
          'Express',
          'Supabase',
          'PostgreSQL',
          'Recharts'
        ],
        features: [
          'Unity VR game with C# scripting',
          'Real-time data synchronization via Supabase',
          'Role-based access control (Student/Professor/Admin)',
          'Chapter completion tracking (4 chapters)',
          'Achievement system with auto-granting',
          'Live leaderboard with podium display',
          'Section management and analytics',
          'Clean Architecture implementation'
        ],
        challenge: 'Managing complex real-time data flows between a Unity VR game and a web dashboard while maintaining data consistency across multiple user roles. The system needed to handle concurrent updates, provide instant feedback, and support detailed analytics without performance degradation.',
        solution: 'Implemented Clean Architecture with MVVM pattern, utilizing Supabase Realtime for WebSocket-based synchronization. Created a layered architecture with clear separation between domain, application, infrastructure, and presentation layers. Used database triggers for automated achievement granting and RPC functions for complex operations.',
        result: 'Successfully deployed a scalable system handling real-time updates for 100+ concurrent users. Achieved sub-second synchronization times for leaderboard updates. The clean architecture enabled easy feature additions and reduced bug density by 60%.',
        heroImage: '/images/NuQuestSamplee.png',
        githubUrl: 'https://github.com/whayneGrageda/VR_Nationalian',
        year: 2026,
        order: 2
      })
    ];
  }
}
