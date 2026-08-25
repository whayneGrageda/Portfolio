import { ISkillRepository } from '@/domain/interfaces/ISkillRepository';
import { Skill, SkillCategory, SkillLevel, SkillGroup } from '@models/Skill';

/**
 * Repository Implementation: Skill
 * Manages skill data access
 */
export class SkillRepository implements ISkillRepository {
  private skills: Skill[];

  constructor() {
    this.skills = this.initializeSkills();
  }

  async getAll(): Promise<Skill[]> {
    return Promise.resolve([...this.skills]);
  }

  async getGroupedByCategory(): Promise<SkillGroup[]> {
    const groups: SkillGroup[] = [];
    const categories = Object.values(SkillCategory);

    for (const category of categories) {
      const categorySkills = this.skills.filter(s => s.category === category);
      if (categorySkills.length > 0) {
        groups.push({
          category,
          skills: categorySkills.sort((a, b) => a.order - b.order)
        });
      }
    }

    return Promise.resolve(groups);
  }

  private initializeSkills(): Skill[] {
    return [
      // Frontend
      { id: '1', name: 'TypeScript', category: SkillCategory.FRONTEND, proficiency: SkillLevel.ADVANCED, order: 1 },
      { id: '2', name: 'HTML5 & CSS3', category: SkillCategory.FRONTEND, proficiency: SkillLevel.ADVANCED, order: 2 },
      { id: '3', name: 'React/Next.js', category: SkillCategory.FRONTEND, proficiency: SkillLevel.ADVANCED, order: 3 },
      { id: '4', name: 'Tailwind', category: SkillCategory.FRONTEND, proficiency: SkillLevel.ADVANCED, order: 4 },
      
      // Backend
      { id: '5', name: 'Node.js & Express', category: SkillCategory.BACKEND, proficiency: SkillLevel.ADVANCED, order: 1 },
      { id: '6', name: 'TypeScript', category: SkillCategory.BACKEND, proficiency: SkillLevel.ADVANCED, order: 2 },
      { id: '7', name: 'RESTful APIs', category: SkillCategory.BACKEND, proficiency: SkillLevel.ADVANCED, order: 3 },
      { id: '8', name: 'Python', category: SkillCategory.BACKEND, proficiency: SkillLevel.ADVANCED, order: 4 },
      
      // Infrastructure
      { id: '9', name: 'Jenkins', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.INTERMEDIATE, order: 1 },
      { id: '10', name: 'Kubernetes', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.INTERMEDIATE, order: 2 },
      { id: '11', name: 'CI/CD Pipelines', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.INTERMEDIATE, order: 3 },
      { id: '12', name: 'Docker', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.INTERMEDIATE, order: 4 },
      { id: '13', name: 'Kafka', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.INTERMEDIATE, order: 5 },

      // Architecture
      { id: '14', name: 'Clean Architecture', category: SkillCategory.ARCHITECTURE, proficiency: SkillLevel.ADVANCED, order: 1 },
      { id: '15', name: 'MVC', category: SkillCategory.ARCHITECTURE, proficiency: SkillLevel.ADVANCED, order: 2 },
      { id: '16', name: 'MVVM', category: SkillCategory.ARCHITECTURE, proficiency: SkillLevel.ADVANCED, order: 3 },
      { id: '17', name: 'Microservices', category: SkillCategory.ARCHITECTURE, proficiency: SkillLevel.INTERMEDIATE, order: 4 }
    ];
  }
}
