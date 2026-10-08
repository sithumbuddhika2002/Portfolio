import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Company } from '../../types/portfolio';
import { TextRoll } from '../ui/text-roll';
import { 
    EnvelopeIcon, 
    PhoneIcon, 
    MapPinIcon, 
    SparklesIcon,
    CalendarIcon,
    DocumentDuplicateIcon,
    CheckIcon,
    BuildingOffice2Icon,
    ArrowTopRightOnSquareIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

export const AboutSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { profile } = data;
    const [copiedText, setCopiedText] = useState<string | null>(null);

    // Rotating titles using 3D TextRoll cylinder flip animation
    const titles = useMemo(() => {
        if (profile.titles && profile.titles.length > 0) {
            return profile.titles;
        }
        return profile.title ? [profile.title] : ['Associate Software Engineer'];
    }, [profile.titles, profile.title]);

    const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

    // Auto-rotate titles every 3.8s smoothly
    useEffect(() => {
        if (titles.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
        }, 3800);
        return () => clearInterval(interval);
    }, [titles.length]);

    // Get companies from data or fallback
    const companies: Company[] = data.companies && data.companies.length > 0
        ? data.companies
        : (data.experience
            ? data.experience.filter((e) => e.type === 'work').map((e) => ({
                id: e.id,
                name: e.company,
                position: e.position,
                logo: e.logo || '',
                period: e.endDate === 'Present' ? 'Present' : `${e.startDate ? e.startDate.slice(0, 4) : ''} - ${e.endDate ? e.endDate.slice(0, 4) : ''}`,
                current: e.endDate === 'Present',
                url: e.url || '',
              }))
            : []);

    // Extract github username dynamically or use default
    const githubUsername = React.useMemo(() => {
        const githubLink = data.contact?.social?.github || '';
        const match = githubLink.match(/github\.com\/([^\/]+)/);
        return match ? match[1] : 'sithumbuddhika2002';
    }, [data.contact?.social?.github]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const highlights = [
        {
            icon: EnvelopeIcon,
            label: 'Email',
            value: profile.email,
            href: `mailto:${profile.email}`,
            copyable: true
        },
        {
            icon: PhoneIcon,
            label: 'Phone',
            value: profile.phone,
            href: `tel:${profile.phone}`,
            copyable: true
        },
        {
            icon: MapPinIcon,
            label: 'Location',
            value: profile.location,
            copyable: false
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1] as const
            }
        }
    };

    return (
        <section 
            id="about" 
            className="section-padding bg-gray-50 dark:bg-gray-950 relative overflow-hidden py-16 sm:py-24"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black font-display tracking-tight text-gray-900 dark:text-white">
                        About Me
                    </h2>
                </motion.div>

                {/* Main Responsive Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
                    
                    {/* Visual / Image Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.55 }}
                        className="lg:col-span-5 flex flex-col items-center w-full transform-gpu"
                    >
                        <div className="relative group w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto">
                            {/* Ambient gradient glow aura */}
                            <div 
                                className="absolute -inset-2 rounded-3xl opacity-25 group-hover:opacity-40 transition duration-500 pointer-events-none" 
                                style={{
                                    background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.35) 0%, rgba(217, 70, 239, 0.25) 45%, rgba(99, 102, 241, 0.15) 65%, transparent 80%)',
                                }}
                            />
                            
                            {/* Glassmorphic Image Frame */}
                            <motion.div 
                                whileHover={{ scale: 1.015 }}
                                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                className="glass-card p-2 sm:p-2.5 rounded-3xl relative overflow-hidden group border border-white/60 dark:border-white/10 shadow-2xl backdrop-blur-md transform-gpu"
                            >
                                {/* Top glass specular light reflection */}
                                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/35 dark:from-white/10 to-transparent pointer-events-none rounded-t-2xl z-10" />

                                <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
                                    <img
                                        src={profile.aboutImage || profile.image}
                                        alt={profile.name}
                                        className="w-full object-cover aspect-[4/5] object-center transition-transform duration-500 ease-out group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Content / Bento Grid Side */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-40px" }}
                        className="lg:col-span-7 space-y-5 sm:space-y-6 w-full transform-gpu"
                    >
                        <motion.div variants={itemVariants} className="space-y-3 sm:space-y-3.5">
                            <div>
                                <p className="text-xs sm:text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                    Hi, I'm
                                </p>
                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight">
                                    <span className="gradient-text">
                                        {profile.name}
                                    </span>
                                </h3>
                            </div>

                            {/* Multiple Titles with TextRoll Animation */}
                            <div
                                className="text-xl sm:text-2xl font-bold min-h-[2.4rem] flex items-center cursor-pointer select-none text-gray-900 dark:text-gray-100"
                                onClick={() => {
                                    if (titles.length > 1) {
                                        setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
                                    }
                                }}
                                title={titles.length > 1 ? "Click to switch title" : undefined}
                            >
                                <TextRoll
                                    duration={0.45}
                                    getEnterDelay={(i) => Math.min(i * 0.02, 0.4)}
                                    getExitDelay={(i) => Math.min(i * 0.02 + 0.03, 0.43)}
                                    className="inline-block text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    {titles[currentTitleIndex % titles.length] || profile.title || ''}
                                </TextRoll>
                            </div>

                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line [overflow-wrap:anywhere] pt-1">
                                {profile.aboutMe || profile.bio}
                            </p>
                        </motion.div>

                        {/* Experience Highlights Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            
                            {/* Field Experience Card */}
                            <motion.div 
                                variants={itemVariants}
                                whileHover={{ y: -3 }}
                                className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:border-primary-500/40 transform-gpu"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                
                                <div className="flex items-start space-x-3.5 sm:space-x-4 relative z-10">
                                    <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl glass-subtle flex items-center justify-center border border-primary-500/30 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 shadow-xs group-hover:scale-105 transition-transform">
                                        <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Field Experience
                                        </h4>
                                        <p className="text-2xl sm:text-3xl font-extrabold font-display gradient-text mt-0.5 sm:mt-1">
                                            4+ Years
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed font-normal sm:font-medium">
                                            Designing interfaces, building open-source projects, and full-stack software development.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Career Experience Card */}
                            <motion.div 
                                variants={itemVariants}
                                whileHover={{ y: -3 }}
                                className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:border-accent-500/40 transform-gpu"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                
                                <div className="flex items-start space-x-3.5 sm:space-x-4 relative z-10">
                                    <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl glass-subtle flex items-center justify-center border border-accent-500/30 dark:border-accent-500/20 text-accent-600 dark:text-accent-400 shadow-xs group-hover:scale-105 transition-transform">
                                        <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Career Experience
                                        </h4>
                                        <p className="text-2xl sm:text-3xl font-extrabold font-display gradient-text mt-0.5 sm:mt-1">
                                            1+ Years
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed font-normal sm:font-medium">
                                            Working in structured professional industry environments, collaborating on production codebases.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* GitHub Contributions Graph Card */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                            className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:border-primary-500/40 transform-gpu"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            
                            <div className="flex items-center justify-between mb-3.5 relative z-10">
                                <div className="flex items-center space-x-2.5">
                                    <div className="w-7 h-7 rounded-lg glass-subtle flex items-center justify-center text-gray-800 dark:text-gray-200">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                        </svg>
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                        GitHub Contributions
                                    </h4>
                                </div>
                                <a 
                                    href={`https://github.com/${githubUsername}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors flex items-center gap-1"
                                >
                                    @{githubUsername}
                                    <ChevronRightIcon className="w-3 h-3" />
                                </a>
                            </div>

                            {/* GitHub contributions calendar graph image with glass enclosure */}
                            <div className="w-full glass-subtle rounded-xl p-3 sm:p-4 border border-white/50 dark:border-white/5 overflow-hidden flex flex-col items-center">
                                <div className="w-full overflow-x-auto scrollbar-thin pb-1">
                                    <img
                                        src={`https://ghchart.rshah.org/0ea5e9/${githubUsername}`}
                                        alt={`${githubUsername}'s GitHub Contributions`}
                                        className="w-full h-auto min-w-[500px] sm:min-w-[550px] object-contain select-none dark:opacity-95"
                                        loading="lazy"
                                    />
                                </div>
                                {/* Mobile swipe hint */}
                                <div className="flex sm:hidden items-center justify-between w-full mt-2 pt-2 border-t border-gray-200/40 dark:border-gray-800/40 text-[10px] text-gray-400">
                                    <span>← Swipe to explore graph →</span>
                                    <span>Live commits</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bento Split Grid: Connectivity & Companies */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
                            
                            {/* Contact Details Card (Clean - categories aligned at the top directly under Connectivity) */}
                            <motion.div 
                                variants={itemVariants} 
                                className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col justify-start transform-gpu"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-60 pointer-events-none" />

                                <div className="relative z-10 flex flex-col justify-start">
                                    <div className="mb-4">
                                        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Connectivity
                                        </h4>
                                    </div>

                                    <div className="space-y-3">
                                        {highlights.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="glass-subtle p-2.5 sm:p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.06] hover:border-primary-500/40 transition-all duration-200 flex items-center justify-between gap-3 group/item"
                                            >
                                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                    <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center text-primary-500 shadow-xs">
                                                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                                                            {item.label}
                                                        </p>
                                                        {item.href ? (
                                                            <a
                                                                href={item.href}
                                                                className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block"
                                                            >
                                                                {item.value}
                                                            </a>
                                                        ) : (
                                                            <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                                                                {item.value}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {item.copyable && (
                                                    <button
                                                        onClick={() => handleCopy(item.value, item.label)}
                                                        className="w-8 h-8 rounded-lg glass-subtle hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center shrink-0 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-all duration-200 border border-black/[0.04] dark:border-white/[0.08] active:scale-95"
                                                        title={`Copy ${item.label}`}
                                                        aria-label={`Copy ${item.label}`}
                                                    >
                                                        {copiedText === item.label ? (
                                                            <CheckIcon className="w-4 h-4 text-emerald-500" />
                                                        ) : (
                                                            <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Companies & Roles Card (Clean - removed Workplaces pill, shows ALL companies without inner scrollbar) */}
                            <motion.div 
                                variants={itemVariants} 
                                className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col justify-start transform-gpu"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-60 pointer-events-none" />

                                <div className="relative z-10 flex flex-col justify-start">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2">
                                            <BuildingOffice2Icon className="w-4 h-4 text-primary-500" />
                                            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Companies & Roles
                                            </h4>
                                        </div>
                                    </div>

                                    {/* All companies visible without cut-offs or inner scrollbars */}
                                    <div className="space-y-2.5 sm:space-y-3">
                                        {companies.length === 0 ? (
                                            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">
                                                No companies added yet.
                                            </div>
                                        ) : (
                                            companies.map((company) => (
                                                <div
                                                    key={company.id}
                                                    className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl glass-subtle hover:bg-white/70 dark:hover:bg-gray-800/60 border border-black/[0.04] dark:border-white/[0.06] hover:border-primary-500/40 transition-all duration-200 gap-3"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        {/* Company Logo Container */}
                                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-gray-800/90 border border-black/[0.04] dark:border-white/[0.08] p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden group-hover:scale-105 transition-transform">
                                                            {company.logo ? (
                                                                <img
                                                                    src={company.logo}
                                                                    alt={company.name}
                                                                    className="w-full h-full object-contain"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLElement).style.display = 'none';
                                                                        e.currentTarget.parentElement?.classList.add('bg-primary-500/10');
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 font-display">
                                                                    {company.name ? company.name.substring(0, 2).toUpperCase() : 'CO'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Details: Position & Company Name */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                                    {company.position}
                                                                </h5>
                                                                {company.current && (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {company.name}
                                                                {company.period ? ` • ${company.period}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Company Link */}
                                                    {company.url && (
                                                        <a
                                                            href={company.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-8 h-8 rounded-lg glass-subtle hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shrink-0 border border-black/[0.04] dark:border-white/[0.08]"
                                                            title={`Visit ${company.name}`}
                                                            aria-label={`Visit ${company.name}`}
                                                        >
                                                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                        </div>

                    </motion.div>

                </div>

            </div>
        </section>
    );
};
