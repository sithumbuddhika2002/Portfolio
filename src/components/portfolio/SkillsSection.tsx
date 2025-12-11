import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';



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

    return (
        <section id="skills" className="section-padding">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        My <span className="gradient-text">Skills</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Technologies and tools I work with
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="group relative"
                            >
                                <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors duration-300 flex items-center gap-4">
                                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-800 rounded-xl p-2 group-hover:bg-gray-700 transition-colors duration-300 overflow-hidden">
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
                                            <span className="text-xl font-bold text-white">
                                                {skill.name[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-gray-100 text-base leading-tight">
                                            {skill.name}
                                        </h4>
                                        <span className="text-sm text-gray-500 font-medium">
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
