import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { 
    BriefcaseIcon, 
    AcademicCapIcon, 
    MapPinIcon, 
    CalendarIcon, 
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
        },
    },
};

export const ExperienceSection: React.FC = () => {
    const { data } = usePortfolioData();
    const [activeTab, setActiveTab] = useState<'all' | 'work' | 'education'>('all');
    const [activeIndex, setActiveIndex] = useState(0);

    const sectionRef = useRef<HTMLDivElement>(null);

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

    const getAchievements = (item: any): string[] => {
        if (item.achievements && item.achievements.length > 0) {
            return item.achievements;
        }
        if (!item.description) return [];
        // Fallback: split long description by sentences
        return item.description
            .split(/\.\s+/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
            .map((s: string) => (s.endsWith('.') ? s : s + '.'));
    };

    const handleDragEnd = (_event: any, info: any) => {
        const threshold = 55;
        if (info.offset.x < -threshold) {
            // Swiped left, next slide
            if (activeIndex < filteredTimeline.length - 1) {
                setActiveIndex((prev) => prev + 1);
            }
        } else if (info.offset.x > threshold) {
            // Swiped right, prev slide
            if (activeIndex > 0) {
                setActiveIndex((prev) => prev - 1);
            }
        }
    };

    return (
        <section 
            id="experience" 
            className="section-padding bg-gray-50/20 dark:bg-gray-950/20 relative overflow-hidden" 
            ref={sectionRef}
        >
            {/* Background decorative glowing orbs */}
            <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent-500/5 dark:bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        My <span className="gradient-text">Journey</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        An interactive timeline stepper mapping out my career and education
                    </p>
                </motion.div>

                {/* Filter Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-905 p-1.5 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md">
                        {(['all', 'work', 'education'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setActiveIndex(0);
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

                {/* Main Stepper Container */}
                {filteredTimeline.length === 0 ? (
                    <div className="text-center py-16 card text-gray-500 dark:text-gray-400">
                        No records found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* LEFT: Navigator (Vertical on Desktop, Horizontal Scroll on Mobile) */}
                        <div className="md:col-span-4 flex flex-col w-full">
                            {/* Mobile Horizontal Timeline Track */}
                            <div className="md:hidden w-full overflow-x-auto pb-4 mb-2 flex items-center gap-3 snap-x scrollbar-none">
                                {filteredTimeline.map((item, index) => {
                                    const isWork = item.type === 'work';
                                    const isActive = activeIndex === index;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveIndex(index)}
                                            className={`flex-shrink-0 snap-center min-w-[200px] p-4 rounded-xl border text-left transition-all duration-300 ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500 ring-2 ring-primary-500/20'
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className={`w-6 h-6 rounded-md bg-gradient-to-r ${
                                                    isWork ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'
                                                } flex items-center justify-center`}>
                                                    {isWork ? (
                                                        <BriefcaseIcon className="w-3.5 h-3.5 text-white" />
                                                    ) : (
                                                        <AcademicCapIcon className="w-3.5 h-3.5 text-white" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                                                    {item.endDate === 'Present' ? 'Present' : new Date(item.endDate).getFullYear()}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold truncate text-gray-950 dark:text-white">
                                                {isWork ? item.position : item.degree}
                                            </h4>
                                            <p className="text-xs truncate text-primary-600 dark:text-primary-400 font-medium">
                                                {isWork ? item.company : item.institution}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Desktop Vertical Timeline Navigator */}
                            <div className="hidden md:flex flex-col relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 space-y-6">
                                {filteredTimeline.map((item, index) => {
                                    const isWork = item.type === 'work';
                                    const isActive = activeIndex === index;
                                    return (
                                        <div
                                            key={item.id}
                                            className="relative flex items-start group"
                                        >
                                            {/* Pulsing Active Node dot on timeline line */}
                                            <div className="absolute -left-[33px] top-4 z-20">
                                                <button
                                                    onClick={() => setActiveIndex(index)}
                                                    className="focus:outline-none cursor-pointer"
                                                >
                                                    {isActive ? (
                                                        <span className="relative flex h-4 w-4">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-primary-500 to-accent-500"></span>
                                                        </span>
                                                    ) : (
                                                        <span className="block h-3.5 w-3.5 rounded-full border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 group-hover:border-primary-500 transition-colors duration-300" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Button card */}
                                            <button
                                                onClick={() => setActiveIndex(index)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                                                    isActive
                                                        ? 'bg-white dark:bg-gray-905 border-primary-500/30 shadow-lg ring-1 ring-primary-500/10 translate-x-1'
                                                        : 'bg-transparent border-transparent hover:bg-gray-100/50 dark:hover:bg-gray-900/30'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 block mb-1">
                                                    {new Date(item.startDate).getFullYear()} - {item.endDate === 'Present' ? 'Present' : new Date(item.endDate).getFullYear()}
                                                </span>
                                                <h4 className={`text-base font-bold transition-colors ${
                                                    isActive ? 'text-gray-950 dark:text-white' : 'text-gray-700 dark:text-gray-400'
                                                }`}>
                                                    {isWork ? item.position : item.degree}
                                                </h4>
                                                <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold font-display">
                                                    {isWork ? item.company : item.institution}
                                                </p>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: Story Details Card */}
                        <div className="md:col-span-8 w-full relative min-h-[500px]">
                            <AnimatePresence mode="wait">
                                {filteredTimeline.map((item, index) => {
                                    if (activeIndex !== index) return null;
                                    const isWork = item.type === 'work';
                                    const achievements = getAchievements(item);
                                    
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 50, scale: 0.98 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.98 }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            dragElastic={0.25}
                                            onDragEnd={handleDragEnd}
                                            className="card shadow-2xl p-6 md:p-8 bg-white dark:bg-gray-905 border border-gray-200 dark:border-gray-800 touch-pan-y cursor-grab active:cursor-grabbing select-none"
                                        >
                                            {/* Story Progress Indicators (Instagram-style) */}
                                            <div className="flex gap-1.5 w-full mb-6">
                                                {filteredTimeline.map((_, dotIndex) => (
                                                    <div
                                                        key={dotIndex}
                                                        className="h-1 flex-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden cursor-pointer"
                                                        onClick={() => setActiveIndex(dotIndex)}
                                                    >
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ 
                                                                width: activeIndex === dotIndex 
                                                                    ? '100%' 
                                                                    : activeIndex > dotIndex 
                                                                        ? '100%' 
                                                                        : '0%' 
                                                            }}
                                                            transition={{ duration: 0.3 }}
                                                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Top Control Bar */}
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                                                    Step {index + 1} of {filteredTimeline.length}
                                                </span>
                                                
                                                {/* Prev/Next buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        disabled={activeIndex === 0}
                                                        onClick={() => setActiveIndex((prev) => prev - 1)}
                                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                                                    >
                                                        <ChevronLeftIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        disabled={activeIndex === filteredTimeline.length - 1}
                                                        onClick={() => setActiveIndex((prev) => prev + 1)}
                                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                                                    >
                                                        <ChevronRightIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Header */}
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${
                                                    isWork ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'
                                                } flex items-center justify-center shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 flex-shrink-0`}>
                                                    {isWork ? (
                                                        <BriefcaseIcon className="w-8 h-8 text-white" />
                                                    ) : (
                                                        <AcademicCapIcon className="w-8 h-8 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-gray-950 dark:text-white">
                                                        {isWork ? item.position : item.degree}
                                                    </h3>
                                                    <p className="text-lg text-primary-600 dark:text-primary-400 font-semibold font-display">
                                                        {isWork ? item.company : item.institution}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Metadata Pills */}
                                            <div className="flex flex-wrap gap-2.5 mb-6">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-805 border border-gray-200/50 dark:border-gray-700/50 text-xs font-bold text-gray-600 dark:text-gray-400 shadow-sm">
                                                    <MapPinIcon className="w-3.5 h-3.5 text-primary-500" />
                                                    {item.location}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-805 border border-gray-200/50 dark:border-gray-700/50 text-xs font-bold text-gray-600 dark:text-gray-400 shadow-sm">
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

                                            {/* Achievements (Staggered Animation list) */}
                                            {achievements.length > 0 && (
                                                <div className="mb-8">
                                                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                                                        Key Achievements & Responsibilities
                                                    </h4>
                                                    <motion.ul
                                                        variants={containerVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        className="space-y-3.5"
                                                    >
                                                        {achievements.map((achievement, bulletIndex) => (
                                                            <motion.li
                                                                key={bulletIndex}
                                                                variants={itemVariants}
                                                                className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 border border-gray-100/50 dark:border-gray-800/30 transition-all duration-300 text-sm text-gray-700 dark:text-gray-350 leading-relaxed shadow-sm group"
                                                            >
                                                                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                                    <CheckIcon className="w-4 h-4" />
                                                                </div>
                                                                <span>{achievement}</span>
                                                            </motion.li>
                                                        ))}
                                                    </motion.ul>
                                                </div>
                                            )}

                                            {/* Skills collection */}
                                            {item.skills && item.skills.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                                                        Skills & Technologies Used
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.skills.map((skill, tagIndex) => (
                                                            <motion.span
                                                                key={skill}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: tagIndex * 0.04 }}
                                                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-500/5 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all duration-300"
                                                            >
                                                                {skill}
                                                            </motion.span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
