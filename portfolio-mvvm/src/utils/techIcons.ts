/**
 * Maps tech stack names to Devicon class names
 */
export const techIconMap: Record<string, string> = {
  // Languages
  'Python': 'devicon-python-plain colored',
  'TypeScript': 'devicon-typescript-plain colored',
  'JavaScript': 'devicon-javascript-plain colored',
  'C#': 'devicon-csharp-plain colored',
  'Java': 'devicon-java-plain colored',
  'CSS': 'devicon-css3-plain colored',
  'HTML': 'devicon-html5-plain colored',
  'HTML5 & CSS3': 'devicon-html5-plain colored',
  'HTML5': 'devicon-html5-plain colored',
  'CSS3': 'devicon-css3-plain colored',

  // Frameworks & Libraries
  'React': 'devicon-react-original colored',
  'React/Next.js': 'devicon-react-original colored',
  'Next.js': 'devicon-nextjs-plain colored',
  'Node.js': 'devicon-nodejs-plain colored',
  'Node.js & Express': 'devicon-nodejs-plain colored',
  'Express': 'devicon-express-original',
  'Express.js': 'devicon-express-original',
  'Tailwind': 'devicon-tailwindcss-plain colored',
  'Tailwind CSS': 'devicon-tailwindcss-plain colored',
  'Unity': 'devicon-unity-original',
  'PyTorch': 'devicon-pytorch-original colored',
  'OpenCV': 'devicon-opencv-plain colored',

  // APIs
  'RESTful APIs': 'devicon-fastapi-plain colored',

  // Databases
  'PostgreSQL': 'devicon-postgresql-plain colored',
  'Supabase': 'devicon-supabase-plain colored',
  'MongoDB': 'devicon-mongodb-plain colored',
  'MySQL': 'devicon-mysql-plain colored',

  // Infrastructure & DevOps
  'Git': 'devicon-git-plain colored',
  'Docker': 'devicon-docker-plain colored',
  'Kubernetes': 'devicon-kubernetes-plain colored',
  'Jenkins': 'devicon-jenkins-plain colored',
  'Kafka': 'devicon-apachekafka-original colored',
  'CI/CD Pipelines': 'devicon-gitlab-plain colored',
  'Vite': 'devicon-vitejs-plain colored',
  'Recharts': 'devicon-react-original colored',

  // Architecture patterns (no devicon, using generic icons)
  'Clean Architecture': '',
  'MVC': '',
  'MVVM': '',
  'Microservices': 'devicon-kubernetes-plain colored',

  // AI/ML (no devicon, fallback)
  'InsightFace': '',
  'FAISS': '',
};

/**
 * Get devicon class for a tech name
 */
export function getTechIcon(tech: string): string {
  const icon = techIconMap[tech] || '';
  console.log(`Tech: ${tech}, Icon: ${icon}`); // Debug log
  return icon;
}
