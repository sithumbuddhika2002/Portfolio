import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';

const categoryColors = {
    frontend: 'from-blue-500 to-cyan-500',
    backend: 'from-green-500 to-emerald-500',
    tools: 'from-purple-500 to-pink-500',
    other: 'from-orange-500 to-red-500',
};

export const SkillsSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { skills } = data;

    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, typeof skills>);

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

                <div className="space-y-12">
                    {Object.entries(groupedSkills).map(([category, categorySkills], catIndex) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: catIndex * 0.1 }}
                        >
                            <h3 className="text-2xl font-bold font-display mb-6 capitalize">
                                {category}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categorySkills.map((skill, index) => (
                                    <motion.div
                                        key={skill.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        className="card-hover group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-lg font-semibold">{skill.name}</h4>
                                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                                {skill.proficiency}%
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${skill.proficiency}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: index * 0.05 }}
                                                className={`h-full bg-gradient-to-r ${categoryColors[skill.category]
                                                    } rounded-full`}
                                            />
                                        </div>

                                        {/* Glow effect on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[skill.category]
                                            } opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300 pointer-events-none`} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
