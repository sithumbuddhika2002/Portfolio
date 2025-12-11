import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export const AboutSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { profile } = data;

    const highlights = [
        {
            icon: EnvelopeIcon,
            label: 'Email',
            value: profile.email,
            href: `mailto:${profile.email}`,
        },
        {
            icon: PhoneIcon,
            label: 'Phone',
            value: profile.phone,
            href: `tel:${profile.phone}`,
        },
        {
            icon: MapPinIcon,
            label: 'Location',
            value: profile.location,
        },
    ];

    return (
        <section id="about" className="section-padding bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        About <span className="gradient-text">Me</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Get to know more about who I am, what I do, and what drives me
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 opacity-20" />
                            <img
                                src={profile.image}
                                alt={profile.name}
                                className="relative w-full max-w-md rounded-2xl shadow-2xl object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div>
                            <h3 className="text-3xl font-bold font-display mb-4">
                                {profile.title}
                            </h3>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                {profile.bio}
                            </p>
                        </div>

                        {/* Contact Highlights */}
                        <div className="space-y-4 pt-6">
                            {highlights.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-4"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {item.label}
                                        </p>
                                        {item.href ? (
                                            <a
                                                href={item.href}
                                                className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                            >
                                                {item.value}
                                            </a>
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {item.value}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
