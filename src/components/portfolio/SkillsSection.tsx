import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { SlingshotLampOverlay } from './SlingshotLampOverlay';
import { githubService } from '../../services/github';

const getSubtitle = (skillName: string): string => {
    const map: Record<string, string> = {
        'HTML5': 'User Interface',
        'CSS3': 'User Interface',
        'Tailwind CSS': 'User Interface',
        'TypeScript': 'User Interface',
        'React': 'Framework',
        'Next.js': 'Web Framework',
        'Vue.js': 'Framework',
        'Angular': 'Framework',
        'Node.js': 'Web Server',
        'Express.js': 'Node Framework',
        'MongoDB': 'Database',
        'PostgreSQL': 'Database',
        'MySQL': 'Database',
        'Firebase': 'Backend as a Service',
        'Figma': 'Design tool',
        'Photoshop': 'Design tool',
        'Illustrator': 'Design tool',
        'Git': 'Version Control',
        'Docker': 'Containerization',
        'AWS': 'Cloud Services',
        'Python': 'Language',
        'Java': 'Language',
        'JavaScript': 'Language',
        'PHP': 'Language',
        'C#': 'Language',
        'C++': 'Language',
        'Swift': 'Language',
        'Kotlin': 'Language',
        'Linux': 'Platform',
        'Android Studio': 'IDE',
        'VS Code': 'IDE',
    };
    return map[skillName] || 'Technology';
};

export const SkillsSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { skills } = data;
    const sectionRef = useRef<HTMLDivElement>(null);

    return (
        <section 
            ref={sectionRef}
            id="skills" 
            className="section-padding relative overflow-hidden"
        >
            {/* Interactive Slingshot Lamp Overlay & Physics Simulation */}
            <SlingshotLampOverlay containerRef={sectionRef} />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 pt-24 sm:pt-32 lg:pt-36"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        My <span className="gradient-text">Skills</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Technologies and tools I work with
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    {skills.map((skill, index) => {
                        const iconUrl = githubService.getSkillIcon(skill.name);

                        // Determine what to render: Custom Icon (SVG/URL) or Default Devicon
                        const hasCustomIcon = !!skill.icon;
                        const isSvg = hasCustomIcon && skill.icon?.trim().startsWith('<svg');

                        return (
                            <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.04 }}
                                whileHover={{ y: -4 }}
                                className="group relative"
                            >
                                <div className="p-2.5 sm:p-4 bg-gray-100 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-300 flex items-center gap-2.5 sm:gap-4">
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg sm:rounded-xl p-1.5 sm:p-2 group-hover:bg-gray-300 dark:group-hover:bg-gray-700 transition-colors duration-300 overflow-hidden">
                                        {hasCustomIcon ? (
                                            isSvg ? (
                                                <div
                                                    className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:text-white"
                                                    dangerouslySetInnerHTML={{ __html: skill.icon! }}
                                                />
                                            ) : (
                                                <img
                                                    src={skill.icon}
                                                    alt={skill.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            )
                                        ) : iconUrl ? (
                                            <img
                                                src={iconUrl}
                                                alt={skill.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                                                {skill.name[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col min-w-0 flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-base leading-tight truncate">
                                            {skill.name}
                                        </h4>
                                        <span className="text-[11px] sm:text-sm text-gray-500 font-medium truncate mt-0.5">
                                            {getSubtitle(skill.name)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
