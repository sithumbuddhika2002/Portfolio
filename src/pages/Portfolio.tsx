import React, { useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { HeroSection } from '../components/portfolio/HeroSection';
import { AboutSection } from '../components/portfolio/AboutSection';
import { SkillsSection } from '../components/portfolio/SkillsSection';
import { ProjectsSection } from '../components/portfolio/ProjectsSection';
import { ExperienceSection } from '../components/portfolio/ExperienceSection';
import { ContactSection } from '../components/portfolio/ContactSection';
import { usePortfolioData } from '../hooks/usePortfolioData';

export const Portfolio: React.FC = () => {
    const { syncWithGitHub } = usePortfolioData();

    useEffect(() => {
        syncWithGitHub();
    }, []);

    return (
        <div className="min-h-screen">
            <Navbar />
            <HeroSection />
            <AboutSection />
            <SkillsSection />
            <ProjectsSection />
            <ExperienceSection />
            <ContactSection />

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © {new Date().getFullYear()} Portfolio. Built with React, TypeScript & Tailwind CSS
                    </p>
                </div>
            </footer>
        </div>
    );
};
