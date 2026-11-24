import React, { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Company } from '../../types/portfolio';
import { TextRoll } from '../ui/text-roll';
import {
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    DocumentDuplicateIcon,
    CheckIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

const CompanyLogo: React.FC<{ logo?: string; name: string }> = ({ logo, name }) => {
    const [failed, setFailed] = useState(false);
    const initials = name ? name.trim().slice(0, 2).toUpperCase() : 'CO';

    return (
        <div className="w-10 h-10 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
            {logo && !failed ? (
                <img
                    src={logo}
                    alt={name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span className="text-[11px] font-mono font-semibold text-[var(--pf-muted)]">
                    {initials}
                </span>
            )}
        </div>
    );
};

export const AboutSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { profile } = data;
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [portraitFailed, setPortraitFailed] = useState(false);
    const [chartFailed, setChartFailed] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const titles = useMemo(() => {
        if (profile.titles && profile.titles.length > 0) {
            return profile.titles.filter(Boolean);
        }
        return profile.title ? [profile.title] : [];
    }, [profile.titles, profile.title]);

    const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

    useEffect(() => {
        if (titles.length <= 1 || prefersReducedMotion) return;
        const interval = setInterval(() => {
            setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
        }, 3800);
        return () => clearInterval(interval);
    }, [titles.length, prefersReducedMotion]);

    const companies: Company[] = useMemo(() => {
        if (data.companies && data.companies.length > 0) {
            return data.companies;
        }
        if (data.experience && data.experience.length > 0) {
            return data.experience.map((e) => ({
                id: e.id,
                name: e.company,
                position: e.position,
                logo: e.logo || '',
                period:
                    e.endDate === 'Present'
                        ? `${e.startDate ? e.startDate.slice(0, 4) : ''} – Present`.replace(/^ – /, '')
                        : `${e.startDate ? e.startDate.slice(0, 4) : ''} – ${e.endDate ? e.endDate.slice(0, 4) : ''}`,
                current: e.endDate === 'Present',
                url: e.url || '',
            }));
        }
        return [];
    }, [data.companies, data.experience]);

    const githubUsername = useMemo(() => {
        const githubLink = data.contact?.social?.github || '';
        const match = githubLink.match(/github\.com\/([^/?#]+)/i);
        return match ? match[1] : 'sithumbuddhika2002';
    }, [data.contact?.social?.github]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard?.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const contactFacts = [
        {
            icon: MapPinIcon,
            label: 'Location',
            value: profile.location,
            copyable: false,
        },
        {
            icon: EnvelopeIcon,
            label: 'Email',
            value: profile.email,
            href: profile.email ? `mailto:${profile.email}` : undefined,
            copyable: true,
        },
        {
            icon: PhoneIcon,
            label: 'Phone',
            value: profile.phone,
            href: profile.phone ? `tel:${profile.phone}` : undefined,
            copyable: true,
        },
    ].filter((item) => Boolean(item.value && item.value.trim()));

    const activeTitle = titles[currentTitleIndex % Math.max(titles.length, 1)] || profile.title || '';
    const portraitSrc = profile.aboutImage || profile.image;

    const fadeProps = prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 14 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: '-40px' },
              transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
          };

    return (
        <section id="about" className="pf-section" aria-labelledby="about-heading">
            <div className="pf-container">
                {/* Section Header */}
                <motion.div {...fadeProps} className="mb-10 sm:mb-12">
                    <p className="pf-eyebrow mb-3">
                        <span className="pf-eyebrow-index">01</span>
                        <span>/</span>
                        <span>About</span>
                    </p>
                    <h2 id="about-heading" className="pf-heading text-3xl sm:text-4xl lg:text-[2.75rem]">
                        Background &amp; Focus
                    </h2>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                    {/* Left Column: Portrait Bento Card */}
                    <motion.div {...fadeProps} className="lg:col-span-4">
                        <div className="pf-bento p-3 max-w-xs sm:max-w-sm lg:max-w-none mx-auto">
                            <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-[var(--pf-surface-2)]">
                                {portraitSrc && !portraitFailed ? (
                                    <img
                                        src={portraitSrc}
                                        alt={profile.name || 'Portrait'}
                                        className="w-full h-full object-cover object-center"
                                        loading="lazy"
                                        onError={() => setPortraitFailed(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-mono text-[var(--pf-muted)]">
                                        {profile.name || 'Portrait'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Bento Stack */}
                    <motion.div {...fadeProps} className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
                        {/* Identity & Bio Bento Card */}
                        <div className="pf-bento p-6 sm:p-7 space-y-4">
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-[var(--pf-ink)]">
                                    {profile.name}
                                </h3>
                                {activeTitle && (
                                    <div className="mt-2 min-h-[1.75rem] flex items-center">
                                        {titles.length > 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentTitleIndex((prev) => (prev + 1) % titles.length)}
                                                className="text-left text-base sm:text-lg font-medium text-[var(--pf-accent)] hover:text-[var(--pf-ink)] transition-colors cursor-pointer"
                                                title="Click to cycle role"
                                            >
                                                {prefersReducedMotion ? (
                                                    <span>{activeTitle}</span>
                                                ) : (
                                                    <TextRoll
                                                        duration={0.4}
                                                        getEnterDelay={(i) => Math.min(i * 0.015, 0.3)}
                                                        getExitDelay={(i) => Math.min(i * 0.015 + 0.02, 0.32)}
                                                        className="inline-block"
                                                    >
                                                        {activeTitle}
                                                    </TextRoll>
                                                )}
                                            </button>
                                        ) : (
                                            <p className="text-base sm:text-lg font-medium text-[var(--pf-accent)]">
                                                {activeTitle}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {(profile.aboutMe || profile.bio) && (
                                <p className="text-sm sm:text-base text-[var(--pf-muted)] leading-relaxed whitespace-pre-line [overflow-wrap:anywhere]">
                                    {profile.aboutMe || profile.bio}
                                </p>
                            )}
                        </div>

                        {/* 2-Column Bento Row: Connectivity & Experience Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            {/* Connectivity Bento Card */}
                            <div className="pf-bento p-5 sm:p-6 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--pf-subtle)] mb-4">
                                        Connectivity
                                    </h4>

                                    {contactFacts.length === 0 ? (
                                        <p className="text-sm text-[var(--pf-muted)]">No contact details listed.</p>
                                    ) : (
                                        <dl className="space-y-2.5">
                                            {contactFacts.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="pf-bento-subtle px-3.5 py-2.5 flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <item.icon
                                                            className="w-4 h-4 text-[var(--pf-subtle)] shrink-0"
                                                            aria-hidden="true"
                                                        />
                                                        <div className="min-w-0">
                                                            <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--pf-subtle)]">
                                                                {item.label}
                                                            </dt>
                                                            <dd className="text-xs sm:text-sm font-medium text-[var(--pf-ink)] truncate">
                                                                {item.href ? (
                                                                    <a
                                                                        href={item.href}
                                                                        className="hover:text-[var(--pf-accent)] transition-colors"
                                                                    >
                                                                        {item.value}
                                                                    </a>
                                                                ) : (
                                                                    <span>{item.value}</span>
                                                                )}
                                                            </dd>
                                                        </div>
                                                    </div>
                                                    {item.copyable && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(item.value, item.label)}
                                                            className="w-8 h-8 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-border-strong)] flex items-center justify-center shrink-0 text-[var(--pf-muted)] hover:text-[var(--pf-ink)] transition-colors cursor-pointer"
                                                            title={`Copy ${item.label}`}
                                                            aria-label={`Copy ${item.label}`}
                                                        >
                                                            {copiedText === item.label ? (
                                                                <CheckIcon className="w-4 h-4 text-[var(--pf-accent)]" />
                                                            ) : (
                                                                <DocumentDuplicateIcon className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </dl>
                                    )}
                                </div>
                            </div>

                            {/* Experience Summary / Companies Bento Card */}
                            <div className="pf-bento p-5 sm:p-6">
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--pf-subtle)]">
                                        Experience Summary
                                    </h4>
                                    {companies.length > 0 && (
                                        <span className="text-[11px] font-mono text-[var(--pf-subtle)]">
                                            {companies.length} {companies.length === 1 ? 'role' : 'roles'}
                                        </span>
                                    )}
                                </div>

                                {companies.length === 0 ? (
                                    <p className="text-sm text-[var(--pf-muted)] py-3">
                                        No roles listed yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {companies.map((company) => (
                                            <div
                                                key={company.id}
                                                className="pf-bento-subtle px-3.5 py-2.5 flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <CompanyLogo logo={company.logo} name={company.name} />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h5 className="text-xs sm:text-sm font-semibold text-[var(--pf-ink)] truncate">
                                                                {company.position}
                                                            </h5>
                                                            {company.current && (
                                                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[var(--pf-surface)] text-[var(--pf-accent)] border border-[var(--pf-border-strong)] shrink-0">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] sm:text-xs text-[var(--pf-muted)] truncate mt-0.5">
                                                            {company.name}
                                                            {company.period ? ` · ${company.period}` : ''}
                                                        </p>
                                                    </div>
                                                </div>

                                                {company.url && (
                                                    <a
                                                        href={company.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-8 h-8 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-border-strong)] flex items-center justify-center text-[var(--pf-muted)] hover:text-[var(--pf-ink)] transition-colors shrink-0"
                                                        title={`Visit ${company.name}`}
                                                        aria-label={`Visit ${company.name}`}
                                                    >
                                                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* GitHub Activity Bento Card (Original Colors) */}
                        <div className="pf-bento p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <svg
                                        className="w-4 h-4 text-[var(--pf-muted)] shrink-0"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                    </svg>
                                    <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--pf-subtle)]">
                                        GitHub Activity
                                    </h4>
                                </div>
                                <a
                                    href={`https://github.com/${githubUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-mono text-[var(--pf-muted)] hover:text-[var(--pf-ink)] transition-colors inline-flex items-center gap-1"
                                >
                                    <span>@{githubUsername}</span>
                                    <span aria-hidden="true">↗</span>
                                </a>
                            </div>

                            <div className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl p-3 sm:p-4 overflow-hidden">
                                {!chartFailed ? (
                                    <>
                                        <div className="w-full overflow-x-auto pb-1">
                                            <img
                                                src={`https://ghchart.rshah.org/${githubUsername}`}
                                                alt={`${githubUsername}'s GitHub Contributions`}
                                                className="w-full h-auto min-w-[520px] object-contain select-none"
                                                loading="lazy"
                                                onError={() => setChartFailed(true)}
                                            />
                                        </div>
                                        <p className="sm:hidden mt-2 pt-2 border-t border-[var(--pf-border)] text-[11px] font-mono text-[var(--pf-subtle)]">
                                            Swipe horizontally to view full year
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-xs text-[var(--pf-muted)] py-4 text-center">
                                        Contribution graph unavailable. View activity directly on{' '}
                                        <a
                                            href={`https://github.com/${githubUsername}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-[var(--pf-ink)]"
                                        >
                                            GitHub ↗
                                        </a>
                                        .
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
