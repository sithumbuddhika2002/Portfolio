import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import { usePortfolioData } from '../../hooks/usePortfolioData';

export const HeroSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { profile } = data;

    const handleResumeDownload = () => {
        if (!profile.resumeUrl) return;

        // Check if it's a Base64 encoded file
        if (profile.resumeUrl.startsWith('data:')) {
            // Extract MIME type and create download
            const mimeMatch = profile.resumeUrl.match(/data:([^;]+);/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';

            // Determine file extension from MIME type
            let extension = '.pdf';
            if (mimeType.includes('msword') || mimeType.includes('document')) {
                extension = mimeType.includes('wordprocessingml') ? '.docx' : '.doc';
            }

            // Create a link element and trigger download
            const link = document.createElement('a');
            link.href = profile.resumeUrl;
            link.download = `${profile.name.replace(/\s+/g, '_')}_Resume${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // It's a URL, open in new tab
            window.open(profile.resumeUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <section
            id="home"
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-primary-500/20 dark:from-primary-900/30 dark:via-accent-900/30 dark:to-primary-900/30 animate-gradient" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full filter blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center md:text-left space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium">
                                Hi, I'm
                            </p>
                            <h1 className="text-5xl md:text-7xl font-bold font-display mt-2">
                                <span className="gradient-text">{profile.name}</span>
                            </h1>
                        </motion.div>

                        <motion.p
                            className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-semibold"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {profile.title}
                        </motion.p>

                        <motion.p
                            className="text-lg text-gray-600 dark:text-gray-400 max-w-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            {profile.bio}
                        </motion.p>

                        <motion.div
                            className="flex flex-wrap gap-4 justify-center md:justify-start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <motion.a
                                href="#contact"
                                className="btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get In Touch
                            </motion.a>
                            {profile.resumeUrl && (
                                <motion.button
                                    onClick={handleResumeDownload}
                                    className="btn-secondary"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Download CV
                                </motion.button>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Profile Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full filter blur-2xl opacity-50"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 0.7, 0.5],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                            <img
                                src={profile.image}
                                alt={profile.name}
                                className="relative w-64 h-64 md:w-96 md:h-96 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    <motion.a
                        href="#about"
                        className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <span className="text-sm mb-2">Scroll Down</span>
                        <ArrowDownIcon className="w-6 h-6" />
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};
