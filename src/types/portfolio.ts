// Portfolio Data Types
export interface PortfolioData {
    profile: Profile;
    skills: Skill[];
    projects: Project[];
    experience: Experience[];
    education: Education[];
    contact: ContactInfo;
    settings: Settings;
}

export interface Profile {
    name: string;
    title: string;
    bio: string;
    image: string;
    resumeUrl: string;
    location: string;
    email: string;
    phone: string;
}

export interface Skill {
    id: string;
    name: string;
    category: 'frontend' | 'backend' | 'tools' | 'other';
    proficiency: number; // 0-100
    icon?: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    image: string;
    technologies: string[];
    liveUrl?: string;
    githubUrl?: string;
    featured: boolean;
    category: string;
    date: string;
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string | 'Present';
    location: string;
    type: 'work';
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string | 'Present';
    location: string;
    type: 'education';
}

export interface ContactInfo {
    email: string;
    phone: string;
    location: string;
    social: SocialLinks;
}

export interface SocialLinks {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    dribbble?: string;
    behance?: string;
}

export interface Settings {
    siteTitle: string;
    tagline: string;
    metaDescription: string;
    adminCredentials: {
        username: string;
        password: string;
    };
    season: 'none' | 'christmas' | 'newyear';
}

// Auth Types
export interface AuthState {
    isAuthenticated: boolean;
    user: null | { username: string };
}
