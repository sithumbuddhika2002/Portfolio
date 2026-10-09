import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getHeroVideo, heroIntro } from '../components/portfolio/heroMedia';
import { PortfolioLoader } from '../components/portfolio/PortfolioLoader';
import { Navbar } from '../components/common/Navbar';
import { HeroSection } from '../components/portfolio/HeroSection';
import { AboutSection } from '../components/portfolio/AboutSection';
import { SkillsSection } from '../components/portfolio/SkillsSection';
import { ProjectsSection } from '../components/portfolio/ProjectsSection';
import { ExperienceSection } from '../components/portfolio/ExperienceSection';
import { ContactSection } from '../components/portfolio/ContactSection';
import { usePortfolioData } from '../hooks/usePortfolioData';

export const Portfolio: React.FC = () => {
    const { loading } = usePortfolioData();

    const [sequenceComplete, setSequenceComplete] = useState(() => heroIntro.completed);
    const [loaderDismissed, setLoaderDismissed] = useState(() => heroIntro.completed);
    const dismissLoader = useCallback(() => {
        heroIntro.completed = true;
        setLoaderDismissed(true);
    }, []);
    useEffect(() => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) getHeroVideo();
    }, []);
    const signatureDestination = useRef<HTMLImageElement>(null);
    const showHomepage = !loading && (sequenceComplete || loaderDismissed);

    return (
        <>
        {!loaderDismissed && <PortfolioLoader exiting={showHomepage} destinationRef={signatureDestination}
            onSequenceComplete={setSequenceComplete} onDismiss={dismissLoader} />}
        {showHomepage && <div className="min-h-screen" inert={!loaderDismissed}>
            <Navbar />
            <HeroSection signatureRef={signatureDestination} signatureHandoff={!loaderDismissed} />
            <AboutSection />
            <SkillsSection />
            <ProjectsSection />
            <ExperienceSection />
            <ContactSection />

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © {new Date().getFullYear()} All Right Reserved | Sithum Buddhika
                    </p>
                </div>
            </footer>
        </div>}
        </>
    );
};
