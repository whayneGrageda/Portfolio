import { Skill, SkillGroup } from '@models/Skill';

/**
 * Repository Interface: Skill
 * Defines contract for skill data access
 */
export interface ISkillRepository {
  /**
   * Get all skills
   */
  getAll(): Promise<Skill[]>;
  
  /**
   * Get skills grouped by category
   */
  getGroupedByCategory(): Promise<SkillGroup[]>;
}
