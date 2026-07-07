import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { 
    BriefcaseIcon, 
    AcademicCapIcon, 
    ChevronDownIcon, 
    MapPinIcon, 
    CalendarIcon, 
    CheckIcon 
} from '@heroicons/react/24/outline';

export const ExperienceSection: React.FC = () => {
    const { data } = usePortfolioData();
    const [activeTab, setActiveTab] = useState<'all' | 'work' | 'education'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end end'],
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const experience = data.experience || [];
    const education = data.education || [];

    const timeline = [...experience, ...education].sort((a, b) => {
        const dateA = a.endDate === 'Present' ? new Date() : new Date(a.endDate);
        const dateB = b.endDate === 'Present' ? new Date() : new Date(b.endDate);
        return dateB.getTime() - dateA.getTime();
    });

    const filteredTimeline = timeline.filter((item) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'work') return item.type === 'work';
        if (activeTab === 'education') return item.type === 'education';
        return true;
    });

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const getAchievements = (item: any): string[] => {
        if (item.achievements && item.achievements.length > 0) {
            return item.achievements;
        }
        // Fallback: split long description by sentences
        if (item.description && item.description.includes('.')) {
            return item.description
                .split(/\.\s+/)
                .map((s: string) => s.trim())
                .map((s: string) => (s.endsWith('.') ? s : s + '.'))
                .filter((s: string) => s.length > 5);
        }
        return [];
    };

    return (
        <section id="experience" className="section-padding bg-gray-50/50 dark:bg-gray-950/10 relative overflow-hidden" ref={sectionRef}>
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        My <span className="gradient-text">Journey</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Education and professional experience that shaped my career
                    </p>
                </motion.div>

                {/* Filter Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-900 p-1.5 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md">
                        {(['all', 'work', 'education'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setExpandedId(null);
                                }}
                                className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-colors duration-300 cursor-pointer z-10 ${
                                    activeTab === tab
                                        ? 'text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
                                }`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg -z-10 shadow-md"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {tab === 'all' ? 'All Journey' : tab === 'work' ? 'Experience' : 'Education'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline Container */}
                <div className="relative">
                    {/* Timeline vertical Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[3px] bg-gray-200 dark:bg-gray-850/80 hidden md:block rounded-full">
                        <motion.div
                            style={{ scaleY, transformOrigin: 'top' }}
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-500 via-accent-500 to-primary-600 rounded-full"
                        />
                    </div>

                    {/* Timeline Items */}
                    <motion.div 
                        layout 
                        className="space-y-8 sm:space-y-12"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredTimeline.map((item, index) => {
                                const isWork = item.type === 'work';
                                const isLeft = index % 2 === 0;
                                const isExpanded = expandedId === item.id;
                                const isHovered = hoveredId === item.id;

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className={`flex items-center gap-8 ${
                                            isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                                        } flex-col`}
                                    >
                                        {/* Card content wrapper */}
                                        <div className="flex-1 w-full z-10">
                                            <motion.div
                                                layout="position"
                                                onMouseEnter={() => setHoveredId(item.id)}
                                                onMouseLeave={() => setHoveredId(null)}
                                                onClick={() => toggleExpand(item.id)}
                                                whileHover={{ scale: 1.01 }}
                                                className={`card cursor-pointer transition-all duration-300 ${
                                                    isExpanded
                                                        ? 'ring-2 ring-primary-500/50 dark:ring-primary-400/50 shadow-2xl bg-white dark:bg-gray-800'
                                                        : 'hover:shadow-xl bg-white dark:bg-gray-800/80'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${
                                                            isWork
                                                                ? 'from-blue-500 to-cyan-500'
                                                                : 'from-purple-500 to-pink-500'
                                                        } flex items-center justify-center shadow-md`}>
                                                            {isWork ? (
                                                                <BriefcaseIcon className="w-6 h-6 text-white" />
                                                            ) : (
                                                                <AcademicCapIcon className="w-6 h-6 text-white" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold tracking-tight">
                                                                {isWork ? item.position : item.degree}
                                                            </h3>
                                                            <p className="text-primary-600 dark:text-primary-400 font-semibold font-display">
                                                                {isWork ? item.company : item.institution}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <motion.div
                                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="text-gray-400 dark:text-gray-500 p-1.5 rounded-full hover:bg-gray-105 dark:hover:bg-gray-700/50"
                                                    >
                                                        <ChevronDownIcon className="w-5 h-5" />
                                                    </motion.div>
                                                </div>

                                                {/* Date & Location tags */}
                                                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50">
                                                        <MapPinIcon className="w-3.5 h-3.5 text-primary-500" />
                                                        {item.location}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-accent-500" />
                                                        {new Date(item.startDate).toLocaleDateString('en-US', {
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

                                                <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed text-sm">
                                                    {isWork ? item.description : item.field}
                                                </p>

                                                {/* Expanded view */}
                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="border-t border-gray-100 dark:border-gray-700/50 mt-6 pt-5 space-y-5">
                                                                {/* Key Achievements */}
                                                                {getAchievements(item).length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                                                                            Key Achievements
                                                                        </h4>
                                                                        <ul className="space-y-2.5">
                                                                            {getAchievements(item).map((achievement, i) => (
                                                                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                                                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                                    <span>{achievement}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Skills list */}
                                                                {item.skills && item.skills.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
                                                                            Skills & Technologies
                                                                        </h4>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {item.skills.map((skill) => (
                                                                                <span
                                                                                    key={skill}
                                                                                    className="text-xs font-medium px-2.5 py-1 rounded bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-100/30 dark:border-primary-900/30"
                                                                                >
                                                                                    {skill}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        </div>

                                        {/* Timeline Dot */}
                                        <div className="hidden md:block relative z-20">
                                            <motion.div
                                                animate={{
                                                    scale: isHovered || isExpanded ? 1.3 : 1,
                                                }}
                                                className={`w-6 h-6 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-r ${
                                                    isWork
                                                        ? 'from-blue-500 to-cyan-500'
                                                        : 'from-purple-500 to-pink-500'
                                                } shadow-lg cursor-pointer`}
                                                onClick={() => toggleExpand(item.id)}
                                            />
                                        </div>

                                        {/* Spacer for alternating layout */}
                                        <div className="flex-1 hidden md:block" />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
