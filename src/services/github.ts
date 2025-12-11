import type { Profile } from '../types/portfolio';

const GITHUB_USERNAME = 'sithumbuddhika2002';
const DEVICON_BASE_URL = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

// Mapping for skill names to devicon names
const skillIconMap: Record<string, string> = {
    // Frontend
    'React': 'react/react-original',
    'TypeScript': 'typescript/typescript-original',
    'JavaScript': 'javascript/javascript-original',
    'HTML5': 'html5/html5-original',
    'CSS3': 'css3/css3-original',
    'Tailwind CSS': 'tailwindcss/tailwindcss-plain',
    'Next.js': 'nextjs/nextjs-original',
    'Vue.js': 'vuejs/vuejs-original',
    'Angular': 'angularjs/angularjs-original',

    // Backend
    'Node.js': 'nodejs/nodejs-original',
    'Express.js': 'express/express-original',
    'Python': 'python/python-original',
    'Django': 'django/django-plain',
    'Java': 'java/java-original',
    'Spring Boot': 'spring/spring-original',
    'PHP': 'php/php-original',
    'Laravel': 'laravel/laravel-plain',

    // Database
    'MongoDB': 'mongodb/mongodb-original',
    'PostgreSQL': 'postgresql/postgresql-original',
    'MySQL': 'mysql/mysql-original',
    'Firebase': 'firebase/firebase-plain',

    // Tools & DevOps
    'Git': 'git/git-original',
    'GitHub': 'github/github-original',
    'Docker': 'docker/docker-original',
    'AWS': 'amazonwebservices/amazonwebservices-original-wordmark',
    'VS Code': 'vscode/vscode-original',
    'Figma': 'figma/figma-original',
};

export const githubService = {
    async getProfile(): Promise<Partial<Profile>> {
        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
            if (!response.ok) throw new Error('Failed to fetch GitHub profile');

            const data = await response.json();

            return {
                name: data.name || data.login,
                bio: data.bio || '',
                image: data.avatar_url,
                location: data.location || '',
                resumeUrl: data.blog || '', // Using blog/website as resume/portfolio link
            };
        } catch (error) {
            console.error('GitHub fetch error:', error);
            return {};
        }
    },

    getSkillIcon(skillName: string): string {
        const normalizedName = Object.keys(skillIconMap).find(
            key => key.toLowerCase() === skillName.toLowerCase()
        );

        if (normalizedName) {
            return `${DEVICON_BASE_URL}/${skillIconMap[normalizedName]}.svg`;
        }

        // Default or fallback icon generator could go here if needed
        // For now returning a generic code icon from heroicons is handled in component
        return '';
    }
};
