import React, { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { SlingshotLampOverlay } from './SlingshotLampOverlay';
import { githubService } from '../../services/github';
import type { Skill } from '../../types/portfolio';

const getSubtitle = (skillName: string): string => {
    const map: Record<string, string> = {
        'HTML5': 'Markup',
        'CSS3': 'Styling',
        'Tailwind CSS': 'Styling',
        'TypeScript': 'Language',
        'React': 'UI Library',
        'Next.js': 'Web Framework',
        'Vue.js': 'Framework',
        'Angular': 'Framework',
        'Node.js': 'Runtime',
        'Express': 'Web Framework',
        'Express.js': 'Web Framework',
        'MongoDB': 'Database',
        'PostgreSQL': 'Database',
        'MySQL': 'Database',
        'SQLite': 'Database',
        'Redis': 'In-Memory Store',
        'Firebase': 'Backend Platform',
        'Figma': 'Design Tool',
        'Photoshop': 'Design Tool',
        'Adobe Photoshop': 'Design Tool',
        'Illustrator': 'Vector Design',
        'Adobe Illustrator': 'Vector Design',
        'Git': 'Version Control',
        'GitHub': 'Code Hosting',
        'Docker': 'Containers',
        'AWS': 'Cloud Platform',
        'Python': 'Language',
        'Java': 'Language',
        'JavaScript': 'Language',
        'PHP': 'Language',
        'C': 'Language',
        'C#': 'Language',
        'C++': 'Language',
        'Swift': 'Language',
        'Kotlin': 'Language',
        'Dart': 'Language',
        'Flutter': 'Mobile Framework',
        'Linux': 'Operating System',
        'Android Studio': 'IDE',
        'VS Code': 'Editor',
    };
    return map[skillName.trim()] || 'Technology';
};

const getMonogram = (name: string): string => {
    const words = name.trim().split(/[\s./-]+/).filter(Boolean);
    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase() || 'SK';
};

const SkillIcon: React.FC<{ skill: Skill }> = ({ skill }) => {
    const deviconUrl = githubService.getSkillIcon(skill.name);
    const customIcon = skill.icon?.trim() || '';
    const isInlineSvg = customIcon.startsWith('<svg');

    const [failedUrls, setFailedUrls] = useState<string[]>([]);

    if (isInlineSvg) {
        return (
            <div
                className="w-full h-full flex items-center justify-center text-[var(--pf-ink)] [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: customIcon }}
            />
        );
    }

    const candidates = [customIcon, deviconUrl].filter(
        (url): url is string => Boolean(url) && !failedUrls.includes(url)
    );
    const activeSrc = candidates[0];

    if (activeSrc) {
        return (
            <img
                src={activeSrc}
                alt={skill.name}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={() => {
                    setFailedUrls((prev) => (prev.includes(activeSrc) ? prev : [...prev, activeSrc]));
                }}
            />
        );
    }

    return (
        <span className="text-xs font-mono font-semibold text-[var(--pf-ink)] tracking-wider">
            {getMonogram(skill.name)}
        </span>
    );
};

const CATEGORY_ORDER: Array<{ key: Skill['category']; label: string }> = [
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend & Data' },
    { key: 'tools', label: 'Tools & Design' },
    { key: 'other', label: 'Other' },
];

export const SkillsSection: React.FC = () => {
    const { data } = usePortfolioData();
    const skills = useMemo(() => data.skills || [], [data.skills]);
    const sectionRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();

    const groupedSkills = useMemo(() => {
        const groups = CATEGORY_ORDER.map((cat) => ({
            ...cat,
            items: skills.filter((s) => s.category === cat.key),
        })).filter((group) => group.items.length > 0);

        const knownKeys = new Set(CATEGORY_ORDER.map((c) => c.key));
        const uncategorized = skills.filter((s) => !knownKeys.has(s.category));
        if (uncategorized.length > 0) {
            groups.push({ key: 'other', label: 'Technologies', items: uncategorized });
        }
        return groups;
    }, [skills]);

    const fadeProps = prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 12 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: '-40px' },
              transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
          };

    return (
        <section
            ref={sectionRef}
            id="skills"
            className="pf-section pf-section--alt relative overflow-hidden"
            aria-labelledby="skills-heading"
        >
            {/* Interactive Slingshot Lamp Overlay & Physics Simulation */}
            <SlingshotLampOverlay containerRef={sectionRef} />

            <div className="pf-container relative z-10">
                {/* Split Section Header with clearance for hanging lamp */}
                <motion.div
                    {...fadeProps}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12 pt-24 sm:pt-32 lg:pt-36"
                >
                    <div>
                        <p className="pf-eyebrow mb-3">
                            <span className="pf-eyebrow-index">02</span>
                            <span>/</span>
                            <span>Capabilities</span>
                        </p>
                        <h2 id="skills-heading" className="pf-heading text-3xl sm:text-4xl lg:text-[2.75rem]">
                            Technical Stack
                        </h2>
                    </div>
                    <p className="pf-lead text-sm sm:text-base max-w-md">
                        Languages, frameworks, and tools used across web, mobile, and backend engineering.
                    </p>
                </motion.div>

                {/* Bento Grid of Skill Categories */}
                {skills.length === 0 ? (
                    <div className="pf-bento p-8 text-center text-sm text-[var(--pf-muted)]">
                        No skills listed yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {groupedSkills.map((group, idx) => {
                            const isOddLast =
                                groupedSkills.length % 2 === 1 && idx === groupedSkills.length - 1;
                            const spanClass =
                                groupedSkills.length === 1 || isOddLast ? 'md:col-span-2' : '';

                            return (
                                <div key={group.label} className={`pf-bento p-5 sm:p-6 ${spanClass}`}>
                                    <div className="flex items-center justify-between border-b border-[var(--pf-border)] pb-3 mb-4">
                                        <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--pf-subtle)]">
                                            {group.label}
                                        </h3>
                                        <span className="text-xs font-mono text-[var(--pf-subtle)]">
                                            {group.items.length}
                                        </span>
                                    </div>

                                    <div
                                        className={`grid gap-2.5 sm:gap-3 ${
                                            spanClass
                                                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                                                : 'grid-cols-1 xs:grid-cols-2'
                                        }`}
                                    >
                                        {group.items.map((skill) => (
                                            <div
                                                key={skill.id}
                                                className="pf-bento-subtle p-3 flex items-center gap-3 hover:border-[var(--pf-border-strong)] transition-colors duration-150"
                                            >
                                                <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center bg-[var(--pf-surface)] border border-[var(--pf-border)] p-2 overflow-hidden">
                                                    <SkillIcon skill={skill} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm font-semibold text-[var(--pf-ink)] leading-tight truncate">
                                                        {skill.name}
                                                    </h4>
                                                    <p className="text-xs text-[var(--pf-muted)] truncate mt-0.5">
                                                        {getSubtitle(skill.name)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};
