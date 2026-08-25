/**
 * Domain Model: Skill
 * Represents a technical skill or proficiency
 */
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillLevel;
  icon?: string;
  order: number;
}

export enum SkillCategory {
  FRONTEND = 'Frontend',
  BACKEND = 'Backend',
  INFRASTRUCTURE = 'Infrastructure',
  ARCHITECTURE = 'Architecture',
  DATABASE = 'Database',
  TOOLS = 'Tools',
  OTHER = 'Other'
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}

export interface SkillGroup {
  category: SkillCategory;
  skills: Skill[];
}
