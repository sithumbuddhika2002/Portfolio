import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const SOCIAL_LABELS: Record<string, string> = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter / X',
    instagram: 'Instagram',
    dribbble: 'Dribbble',
    behance: 'Behance',
};

export const ContactSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { contact } = data;
    const prefersReducedMotion = useReducedMotion();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [draftOpened, setDraftOpened] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const emailTo = contact.email || 'sithumbuddhika2002@gmail.com';
        const subject = encodeURIComponent(formData.subject);
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        );
        const mailtoLink = `mailto:${emailTo}?subject=${subject}&body=${body}`;

        window.location.href = mailtoLink;

        setDraftOpened(true);
        setTimeout(() => {
            setDraftOpened(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3500);
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
            href: contact.email ? `mailto:${contact.email}` : undefined,
        },
        {
            icon: PhoneIcon,
            label: 'Phone',
            value: contact.phone,
            href: contact.phone ? `tel:${contact.phone}` : undefined,
        },
        {
            icon: MapPinIcon,
            label: 'Location',
            value: contact.location,
        },
    ].filter((item) => Boolean(item.value && item.value.trim()));

    const socialLinks = Object.entries(contact.social || {}).filter(
        ([, url]) => Boolean(url && url.trim())
    );

    const fadeProps = prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 12 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: '-40px' },
              transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
          };

    return (
        <section id="contact" className="pf-section" aria-labelledby="contact-heading">
            <div className="pf-container">
                {/* Section Header */}
                <motion.div {...fadeProps} className="mb-10 sm:mb-12 space-y-3">
                    <p className="pf-eyebrow">
                        <span className="pf-eyebrow-index">05</span>
                        <span>/</span>
                        <span>Contact</span>
                    </p>
                    <h2 id="contact-heading" className="pf-heading text-3xl sm:text-4xl lg:text-[2.75rem]">
                        Get in Touch
                    </h2>
                    <p className="pf-lead text-sm sm:text-base max-w-xl">
                        Open to software engineering opportunities, technical collaborations, and project inquiries.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                    {/* Left Column: Two Bento Cards (Contact Info + Social Profiles) */}
                    <motion.div {...fadeProps} className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
                        {contactInfo.length > 0 && (
                            <div className="pf-bento p-5 sm:p-6 flex-1">
                                <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--pf-subtle)] mb-4">
                                    Direct Contact
                                </h3>
                                <div className="space-y-3">
                                    {contactInfo.map((item) => (
                                        <div
                                            key={item.label}
                                            className="pf-bento-subtle p-3.5 flex items-center gap-3.5"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] flex items-center justify-center shrink-0 text-[var(--pf-ink)]">
                                                <item.icon className="w-4 h-4" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--pf-subtle)]">
                                                    {item.label}
                                                </p>
                                                {item.href ? (
                                                    <a
                                                        href={item.href}
                                                        className="text-sm font-medium text-[var(--pf-ink)] hover:text-[var(--pf-accent)] transition-colors break-all"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm font-medium text-[var(--pf-ink)]">
                                                        {item.value}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {socialLinks.length > 0 && (
                            <div className="pf-bento p-5 sm:p-6">
                                <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--pf-subtle)] mb-4">
                                    Profiles
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {socialLinks.map(([platform, url]) => (
                                        <a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3.5 py-2 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface-2)] hover:border-[var(--pf-border-strong)] text-xs font-medium text-[var(--pf-ink)] transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <span>{SOCIAL_LABELS[platform] || platform}</span>
                                            <span aria-hidden="true" className="text-[var(--pf-muted)]">↗</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column: Email Draft Form Bento Card */}
                    <motion.div {...fadeProps} className="lg:col-span-7">
                        <form onSubmit={handleSubmit} className="pf-bento p-6 sm:p-8 space-y-5 h-full flex flex-col justify-between">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label
                                            htmlFor="contact-name"
                                            className="block text-xs font-mono uppercase tracking-[0.14em] text-[var(--pf-muted)] mb-2"
                                        >
                                            Name
                                        </label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="pf-input"
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="contact-email"
                                            className="block text-xs font-mono uppercase tracking-[0.14em] text-[var(--pf-muted)] mb-2"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="contact-email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="pf-input"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-subject"
                                        className="block text-xs font-mono uppercase tracking-[0.14em] text-[var(--pf-muted)] mb-2"
                                    >
                                        Subject
                                    </label>
                                    <input
                                        id="contact-subject"
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="pf-input"
                                        placeholder="Project inquiry or collaboration"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-message"
                                        className="block text-xs font-mono uppercase tracking-[0.14em] text-[var(--pf-muted)] mb-2"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="pf-input resize-none"
                                        placeholder="Write your message..."
                                    />
                                </div>
                            </div>

                            <div className="pt-2 space-y-2.5">
                                <button type="submit" className="pf-btn-primary w-full justify-center">
                                    {draftOpened ? 'Email Draft Opened ↗' : 'Open in Email Client ↗'}
                                </button>
                                <p className="text-xs text-[var(--pf-subtle)] text-center">
                                    Opens a pre-filled draft in your default email application.
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
