import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { 
    EnvelopeIcon, 
    PhoneIcon, 
    MapPinIcon, 
    SparklesIcon,
    CalendarIcon,
    DocumentDuplicateIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

export const AboutSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { profile } = data;
    const [copiedText, setCopiedText] = useState<string | null>(null);

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

    const philosophyTags = [
        { text: 'Clean Code', icon: '💻', color: 'from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
        { text: 'UX/UI Design', icon: '🎨', color: 'from-fuchsia-500/10 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20' },
        { text: 'Problem Solving', icon: '⚡', color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
        { text: 'Pixel Perfection', icon: '📐', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
        { text: 'Fast Performance', icon: '🚀', color: 'from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
        { text: 'Lifelong Learner', icon: '💡', color: 'from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as const
            }
        }
    };

    return (
        <section id="about" className="section-padding bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
            {/* Glowing Decorative Background Blobs */}
            <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary-500/10 rounded-full filter blur-3xl -z-10 dark:bg-primary-900/10 pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl -z-10 dark:bg-accent-900/10 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent px-3 py-1 rounded-full bg-primary-500/5 border border-primary-500/10">
                        Experience & Contributions
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold font-display mt-3 mb-4">
                        About <span className="gradient-text">Me</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Get to know my experience, core principles, and my active open-source contributions.
                    </p>
                </motion.div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Visual/Image Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-5 flex flex-col items-center"
                    >
                        <div className="relative group cursor-pointer w-full max-w-sm">
                            {/* Slow gradient glow ring behind the image */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition duration-500 animate-pulse" />
                            
                            {/* Main Image Container */}
                            <motion.div 
                                whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900"
                            >
                                <img
                                    src={profile.aboutImage || profile.image}
                                    alt={profile.name}
                                    className="w-full object-cover aspect-[4/5] object-center transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Pulse green dot available badge */}
                                <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20 dark:border-gray-700/30 shadow-lg backdrop-blur-md">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-semibold text-gray-800 dark:text-gray-200">
                                        Open to Opportunities
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Content/Bento Grid Side */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="lg:col-span-7 space-y-6"
                    >
                        {/* Experience Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Field Experience Card */}
                            <motion.div 
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                                className="glass p-6 rounded-2xl border border-white/10 dark:border-gray-900/30 shadow-md relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 dark:bg-primary-950/20 dark:border-primary-900/30">
                                        <SparklesIcon className="w-6 h-6 text-primary-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                            Field Experience
                                        </h4>
                                        <p className="text-3xl font-extrabold font-display text-gray-900 dark:text-gray-100 mt-1">
                                            4+ Years
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-medium">
                                            Designing interfaces, building open-source projects, and full-stack software development.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Career Experience Card */}
                            <motion.div 
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                                className="glass p-6 rounded-2xl border border-white/10 dark:border-gray-900/30 shadow-md relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center border border-accent-500/20 dark:bg-accent-950/20 dark:border-accent-900/30">
                                        <CalendarIcon className="w-6 h-6 text-accent-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                            Career Experience
                                        </h4>
                                        <p className="text-3xl font-extrabold font-display text-gray-900 dark:text-gray-100 mt-1">
                                            1+ Years
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-medium">
                                            Working in structured professional industry environments, collaborating on production codebases.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* GitHub Contributions Graph Card */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            className="glass p-6 rounded-2xl border border-white/10 dark:border-gray-900/30 shadow-md relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2.5">
                                    <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                    </svg>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">
                                        GitHub Contributions
                                    </h4>
                                </div>
                                <a 
                                    href={`https://github.com/${githubUsername}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
                                >
                                    @{githubUsername}
                                </a>
                            </div>

                            {/* GitHub contributions calendar graph image */}
                            <div className="w-full bg-white/40 dark:bg-gray-900/40 rounded-xl p-4 border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-center overflow-x-auto">
                                <img
                                    src={`https://ghchart.rshah.org/0ea5e9/${githubUsername}`}
                                    alt={`${githubUsername}'s GitHub Contributions`}
                                    className="w-full h-auto min-w-[550px] object-contain select-none dark:brightness-95 dark:contrast-110"
                                />
                            </div>
                        </motion.div>

                        {/* Bento Details Split Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            
                            {/* Contact Details Card */}
                            <motion.div variants={itemVariants} className="glass md:col-span-6 p-6 rounded-2xl border border-white/10 dark:border-gray-900/30 shadow-md flex flex-col justify-between">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                                    Connectivity
                                </h4>
                                <div className="space-y-4">
                                    {highlights.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-3 group/item">
                                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50">
                                                <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                                                    {item.label}
                                                </p>
                                                {item.href ? (
                                                    <a
                                                        href={item.href}
                                                        className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-all"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                                                        {item.value}
                                                    </p>
                                                )}
                                            </div>
                                            {item.copyable && (
                                                <button
                                                    onClick={() => handleCopy(item.value, item.label)}
                                                    className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 border border-gray-200/40 dark:border-gray-800"
                                                    title={`Copy ${item.label}`}
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
                            </motion.div>

                            {/* Philosophy Tags Card */}
                            <motion.div variants={itemVariants} className="glass md:col-span-6 p-6 rounded-2xl border border-white/10 dark:border-gray-900/30 shadow-md">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                                    Philosophy
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {philosophyTags.map((tag, index) => (
                                        <motion.span
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border bg-gradient-to-r ${tag.color} flex items-center gap-1.5 shadow-sm transition-all duration-300`}
                                        >
                                            <span>{tag.icon}</span>
                                            <span>{tag.text}</span>
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                        </div>

                    </motion.div>

                </div>

            </div>
        </section>
    );
};


