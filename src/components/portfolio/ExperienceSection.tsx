import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { BriefcaseIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export const ExperienceSection: React.FC = () => {
    const { data } = usePortfolioData();
    const timeline = [...data.experience, ...data.education].sort((a, b) => {
        const dateA = a.endDate === 'Present' ? new Date() : new Date(a.endDate);
        const dateB = b.endDate === 'Present' ? new Date() : new Date(b.endDate);
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <section id="experience" className="section-padding">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        My <span className="gradient-text">Journey</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Education and professional experience that shaped my career
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary-500 via-accent-500 to-primary-500 hidden md:block" />

                    {/* Timeline Items */}
                    <div className="space-y-12">
                        {timeline.map((item, index) => {
                            const isWork = item.type === 'work';
                            const isLeft = index % 2 === 0;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`flex items-center gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                                        } flex-col`}
                                >
                                    {/* Content */}
                                    <div className="flex-1 md:text-right md:pr-8 md:pl-0 w-full">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="card-hover"
                                        >
                                            <div className="flex items-start gap-4 mb-3">
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r ${isWork
                                                        ? 'from-blue-500 to-cyan-500'
                                                        : 'from-purple-500 to-pink-500'
                                                    } flex items-center justify-center`}>
                                                    {isWork ? (
                                                        <BriefcaseIcon className="w-6 h-6 text-white" />
                                                    ) : (
                                                        <AcademicCapIcon className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold">
                                                        {isWork ? item.position : item.degree}
                                                    </h3>
                                                    <p className="text-primary-600 dark:text-primary-400 font-semibold">
                                                        {isWork ? item.company : item.institution}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                {isWork ? item.description : `${item.field}`}
                                            </p>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span>📍 {item.location}</span>
                                                <span>
                                                    📅 {new Date(item.startDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                    })}{' '}
                                                    -{' '}
                                                    {item.endDate === 'Present'
                                                        ? 'Present'
                                                        : new Date(item.endDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                        })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Timeline Dot */}
                                    <div className="hidden md:block relative">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-r ${isWork
                                                    ? 'from-blue-500 to-cyan-500'
                                                    : 'from-purple-500 to-pink-500'
                                                } shadow-lg`}
                                        />
                                    </div>

                                    {/* Spacer for alternating layout */}
                                    <div className="flex-1 hidden md:block" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
