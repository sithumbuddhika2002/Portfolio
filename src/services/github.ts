import type { Profile } from '../types/portfolio';

const GITHUB_USERNAME = 'sithumbuddhika2002';
const DEVICON_BASE_URL = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

// Mapping for skill names to devicon paths
const skillIconMap: Record<string, string> = {
    // Frontend & Mobile
    'React': 'react/react-original',
    'TypeScript': 'typescript/typescript-original',
    'JavaScript': 'javascript/javascript-original',
    'HTML5': 'html5/html5-original',
    'CSS3': 'css3/css3-original',
    'Tailwind CSS': 'tailwindcss/tailwindcss-original',
    'Next.js': 'nextjs/nextjs-original',
    'Vue.js': 'vuejs/vuejs-original',
    'Angular': 'angularjs/angularjs-original',
    'Redux': 'redux/redux-original',
    'Sass': 'sass/sass-original',
    'Bootstrap': 'bootstrap/bootstrap-original',
    'Material UI': 'materialui/materialui-original',
    'Vite': 'vitejs/vitejs-original',
    'Flutter': 'flutter/flutter-original',
    'Dart': 'dart/dart-original',
    'Kotlin': 'kotlin/kotlin-original',
    'Swift': 'swift/swift-original',
    'Android Studio': 'androidstudio/androidstudio-original',

    // Backend & Languages
    'Node.js': 'nodejs/nodejs-original',
    'Express': 'express/express-original',
    'Express.js': 'express/express-original',
    'Python': 'python/python-original',
    'Django': 'django/django-plain',
    'Java': 'java/java-original',
    'Spring Boot': 'spring/spring-original',
    'PHP': 'php/php-original',
    'Laravel': 'laravel/laravel-original',
    'C': 'c/c-original',
    'C++': 'cplusplus/cplusplus-original',
    'C#': 'csharp/csharp-original',
    'Go': 'go/go-original',
    'Rust': 'rust/rust-original',
    'GraphQL': 'graphql/graphql-plain',

    // Database
    'MongoDB': 'mongodb/mongodb-original',
    'PostgreSQL': 'postgresql/postgresql-original',
    'MySQL': 'mysql/mysql-original',
    'SQLite': 'sqlite/sqlite-original',
    'Redis': 'redis/redis-original',
    'Firebase': 'firebase/firebase-original',

    // Tools, Design & DevOps
    'Git': 'git/git-original',
    'GitHub': 'github/github-original',
    'Docker': 'docker/docker-original',
    'AWS': 'amazonwebservices/amazonwebservices-original-wordmark',
    'Linux': 'linux/linux-original',
    'VS Code': 'vscode/vscode-original',
    'Postman': 'postman/postman-original',
    'Figma': 'figma/figma-original',
    'Photoshop': 'photoshop/photoshop-plain',
    'Adobe Photoshop': 'photoshop/photoshop-plain',
    'Illustrator': 'illustrator/illustrator-plain',
    'Adobe Illustrator': 'illustrator/illustrator-plain',
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
        const cleanName = skillName.trim().toLowerCase();
        const normalizedName = Object.keys(skillIconMap).find(
            (key) => key.toLowerCase() === cleanName
        );

        if (normalizedName) {
            return `${DEVICON_BASE_URL}/${skillIconMap[normalizedName]}.svg`;
        }

        return '';
    },
};
