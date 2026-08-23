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
      { id: '1', name: 'React & Next.js', category: SkillCategory.FRONTEND, proficiency: SkillLevel.ADVANCED, order: 1 },
      { id: '2', name: 'TypeScript', category: SkillCategory.FRONTEND, proficiency: SkillLevel.ADVANCED, order: 2 },
      { id: '3', name: 'Tailwind CSS', category: SkillCategory.FRONTEND, proficiency: SkillLevel.ADVANCED, order: 3 },
      { id: '4', name: 'Three.js / WebGL', category: SkillCategory.FRONTEND, proficiency: SkillLevel.INTERMEDIATE, order: 4 },
      { id: '5', name: 'HTML5 & CSS3', category: SkillCategory.FRONTEND, proficiency: SkillLevel.EXPERT, order: 5 },
      
      // Backend
      { id: '6', name: 'Node.js & Express', category: SkillCategory.BACKEND, proficiency: SkillLevel.ADVANCED, order: 1 },
      { id: '7', name: 'Python', category: SkillCategory.BACKEND, proficiency: SkillLevel.ADVANCED, order: 2 },
      { id: '8', name: 'RESTful APIs', category: SkillCategory.BACKEND, proficiency: SkillLevel.ADVANCED, order: 3 },
      { id: '9', name: 'GraphQL', category: SkillCategory.BACKEND, proficiency: SkillLevel.INTERMEDIATE, order: 4 },
      { id: '10', name: 'C#', category: SkillCategory.BACKEND, proficiency: SkillLevel.INTERMEDIATE, order: 5 },
      
      // Infrastructure
      { id: '11', name: 'PostgreSQL', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.ADVANCED, order: 1 },
      { id: '12', name: 'Docker', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.INTERMEDIATE, order: 2 },
      { id: '13', name: 'AWS (EC2, S3, RDS)', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.INTERMEDIATE, order: 3 },
      { id: '14', name: 'CI/CD Pipelines', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.INTERMEDIATE, order: 4 },
      { id: '15', name: 'Linux Administration', category: SkillCategory.INFRASTRUCTURE, proficiency: SkillLevel.ADVANCED, order: 5 }
    ];
  }
}
