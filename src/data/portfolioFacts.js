import { awardsData, featuredProjectIds, projectDetails, timelineData } from './projectData';

export const portfolioProfile = {
  name: 'Kurt Fariñas',
  role: 'Junior Full-Stack Developer',
  employer: "People's Multi-Purpose Cooperative",
  roleStarted: 'September 16, 2026',
  statement: 'I build interfaces and workflow systems that make everyday work easier to manage.',
  education: 'BS Computer Science | STI College San Jose',
  educationDates: 'September 2022–July 2026',
  email: 'kurtfarinas2022@gmail.com',
  github: 'https://github.com/kurt-farinas',
  linkedin: 'https://www.linkedin.com/in/kurt-vincent-fari%C3%B1as-315ab1367',
  resume: '/resume.pdf'
};

export const technologyGroups = {
  Frontend: ['React', 'TypeScript', 'JavaScript', 'Inertia.js', 'Tailwind CSS', 'HTML / CSS', 'Chart.js', 'Next.js'],
  Backend: ['Laravel', 'PHP', 'FastAPI', 'Python'],
  Data: ['MySQL', 'SQLite'],
  Languages: ['Java'],
  Tools: ['PHPUnit & Pest', 'Git / GitHub', 'Docker']
};

export const portfolioProjects = featuredProjectIds.map(id => projectDetails[id]);
export { timelineData, awardsData };

export function portfolioCommand(input) {
  const command = input.trim().toLowerCase();
  const p = portfolioProfile;
  if (!command) return { lines: [] };
  const responses = {
    help: ['Simulated portfolio terminal. Commands do not access your computer.', 'help · whoami · education · experience · projects · skills · contact · resume · clear / cls'],
    whoami: [p.name, `${p.role} at ${p.employer} since ${p.roleStarted}.`, p.statement],
    education: [p.education, p.educationDates, 'Presidential List (2022).'],
    experience: timelineData.flatMap(item => [item.date + ' | ' + item.title, item.desc]),
    projects: portfolioProjects.flatMap((project, index) => [
      `${index + 1}. ${project.title} | ${project.roleTag}`,
      project.cardSummary,
      ...(project.websiteUrl ? ['Public website: ' + project.websiteUrl] : []),
      ...(project.codeUrl ? ['Code: ' + project.codeUrl] : [])
    ]),
    skills: Object.entries(technologyGroups).map(([category, skills]) => category + ': ' + skills.join(', ')),
    contact: [p.email, p.github, p.linkedin],
    resume: ['Opening the actual résumé PDF app. Direct file: ' + p.resume]
  };
  if (command === 'clear' || command === 'cls') return { clear: true, lines: [] };
  return { lines: responses[command] || [`Unknown command: ${input}. Type help for available commands.`], ...(command === 'resume' ? { app: 'resume' } : {}) };
}
