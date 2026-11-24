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
import '../components/portfolio/portfolioTheme.css';

export const Portfolio: React.FC = () => {
    const { data, loading } = usePortfolioData();

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
    const ownerName = data.profile?.name || 'Sithum Buddhika';

    return (
        <>
        {!loaderDismissed && <PortfolioLoader exiting={showHomepage} destinationRef={signatureDestination}
            onSequenceComplete={setSequenceComplete} onDismiss={dismissLoader} />}
        {showHomepage && <div className="portfolio-public min-h-screen" inert={!loaderDismissed}>
            <Navbar />
            <main>
                <HeroSection signatureRef={signatureDestination} signatureHandoff={!loaderDismissed} />
                <AboutSection />
                <SkillsSection />
                <ProjectsSection />
                <ExperienceSection />
                <ContactSection />
            </main>

            <footer className="bg-[var(--pf-bg)] border-t border-[var(--pf-border)] text-[var(--pf-muted)] py-8 px-5 sm:px-8 lg:px-18">
                <div className="max-w-[78rem] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p>
                        © {new Date().getFullYear()} {ownerName}. All rights reserved.
                    </p>
                    <a
                        href="#home"
                        onClick={(e) => {
                            e.preventDefault();
                            document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[var(--pf-muted)] hover:text-[var(--pf-ink)] transition-colors tracking-[0.16em] uppercase"
                    >
                        Back to top ↑
                    </a>
                </div>
            </footer>
        </div>}
        </>
    );
};
