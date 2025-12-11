import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export const ContactSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { contact } = data;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since no backend, just show success message
        setSubmitStatus('success');
        setTimeout(() => {
            setSubmitStatus('idle');
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const contactInfo = [
        {
            icon: EnvelopeIcon,
            label: 'Email',
            value: contact.email,
            href: `mailto:${contact.email}`,
        },
        {
            icon: PhoneIcon,
            label: 'Phone',
            value: contact.phone,
            href: `tel:${contact.phone}`,
        },
        {
            icon: MapPinIcon,
            label: 'Location',
            value: contact.location,
        },
    ];

    const socialLinks = Object.entries(contact.social).filter(([, url]) => url);

    return (
        <section id="contact" className="section-padding bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        Get In <span className="gradient-text">Touch</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Have a project in mind? Let's work together to create something amazing
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div>
                            <h3 className="text-2xl font-bold font-display mb-6">
                                Contact Information
                            </h3>
                            <div className="space-y-6">
                                {contactInfo.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-4"
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
                        </div>

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Connect With Me</h3>
                                <div className="flex gap-4">
                                    {socialLinks.map(([platform, url]) => (
                                        <motion.a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-accent-500 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-white transition-all"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <span className="capitalize text-sm font-semibold">
                                                {platform.slice(0, 2)}
                                            </span>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <form onSubmit={handleSubmit} className="card space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="What's this about?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="input-field resize-none"
                                    placeholder="Your message..."
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="btn-primary w-full"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {submitStatus === 'success' ? '✓ Message Sent!' : 'Send Message'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
