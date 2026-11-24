import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Education, Experience } from '../../types/portfolio';
import {
    BriefcaseIcon,
    AcademicCapIcon,
    MapPinIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

type TimelineItem = Experience | Education;

const safeTimestamp = (dateStr?: string): number => {
    if (!dateStr) return 0;
    if (dateStr === 'Present') return Date.now();
    const parsed = new Date(dateStr).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatYear = (dateStr?: string): string => {
    if (!dateStr) return '';
    if (dateStr === 'Present') return 'Present';
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
    const match = dateStr.match(/\d{4}/);
    return match ? match[0] : dateStr;
};

const formatMonthYear = (dateStr?: string): string => {
    if (!dateStr) return '';
    if (dateStr === 'Present') return 'Present';
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    return dateStr;
};

const getAchievements = (item: TimelineItem): string[] => {
    if (item.achievements && item.achievements.length > 0) {
        return item.achievements.filter(Boolean);
    }
    if (item.type === 'work' && item.description) {
        return item.description
            .split(/\.\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .map((s) => (s.endsWith('.') ? s : `${s}.`));
    }
    return [];
};

const OrgLogo: React.FC<{ logo?: string; name: string; isWork: boolean; size?: 'sm' | 'md' }> = ({
    logo,
    name,
    isWork,
    size = 'sm',
}) => {
    const [failed, setFailed] = useState(false);
    const dim = size === 'md' ? 'w-12 h-12 p-2 rounded-xl' : 'w-9 h-9 p-1.5 rounded-lg';
    const iconDim = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

    return (
        <div
            className={`${dim} bg-[var(--pf-surface-2)] border border-[var(--pf-border)] shrink-0 flex items-center justify-center overflow-hidden text-[var(--pf-ink)]`}
        >
            {logo && !failed ? (
                <img
                    src={logo}
                    alt={name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={() => setFailed(true)}
                />
            ) : isWork ? (
                <BriefcaseIcon className={iconDim} aria-hidden="true" />
            ) : (
                <AcademicCapIcon className={iconDim} aria-hidden="true" />
            )}
        </div>
    );
};

export const ExperienceSection: React.FC = () => {
    const { data } = usePortfolioData();
    const [activeTab, setActiveTab] = useState<'all' | 'work' | 'education'>('all');
    const [activeIndex, setActiveIndex] = useState(0);
    const prefersReducedMotion = useReducedMotion();

    const timeline = useMemo<TimelineItem[]>(() => {
        const experience = data.experience || [];
        const education = data.education || [];
        return [...experience, ...education].sort(
            (a, b) => safeTimestamp(b.endDate) - safeTimestamp(a.endDate)
        );
    }, [data.experience, data.education]);

    const filteredTimeline = useMemo(
        () =>
            timeline.filter((item) => {
                if (activeTab === 'all') return true;
                return item.type === activeTab;
            }),
        [timeline, activeTab]
    );

    const safeIndex =
        filteredTimeline.length > 0
            ? Math.min(activeIndex, filteredTimeline.length - 1)
            : 0;
    const currentItem = filteredTimeline[safeIndex];

    const fadeProps = prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 12 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: '-40px' },
              transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
          };

    return (
        <section
            id="experience"
            className="pf-section pf-section--alt"
            aria-labelledby="experience-heading"
        >
            <div className="pf-container">
                {/* Split Header & Filter Tabs */}
                <motion.div
                    {...fadeProps}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12"
                >
                    <div className="space-y-3">
                        <p className="pf-eyebrow">
                            <span className="pf-eyebrow-index">04</span>
                            <span>/</span>
                            <span>Experience</span>
                        </p>
                        <h2 id="experience-heading" className="pf-heading text-3xl sm:text-4xl lg:text-[2.75rem]">
                            Experience &amp; Education
                        </h2>
                        <p className="pf-lead text-sm sm:text-base max-w-xl">
                            Professional roles, academic background, and key technical contributions.
                        </p>
                    </div>

                    <div
                        className="inline-flex self-start md:self-auto rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-1"
                        role="tablist"
                        aria-label="Filter timeline"
                    >
                        {(['all', 'work', 'education'] as const).map((tab) => {
                            const isActive = activeTab === tab;
                            const label =
                                tab === 'all' ? 'All' : tab === 'work' ? 'Experience' : 'Education';
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setActiveIndex(0);
                                    }}
                                    className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                                        isActive
                                            ? 'bg-[var(--pf-ink)] text-[var(--pf-bg)]'
                                            : 'text-[var(--pf-muted)] hover:text-[var(--pf-ink)]'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Bento Timeline Stepper */}
                {filteredTimeline.length === 0 || !currentItem ? (
                    <div className="pf-bento p-12 text-center text-sm text-[var(--pf-muted)]">
                        No timeline records found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
                        {/* Left Navigator */}
                        <div className="md:col-span-4 w-full">
                            {/* Mobile Horizontal Strip */}
                            <div className="md:hidden w-full overflow-x-auto pb-3 flex items-stretch gap-3 snap-x">
                                {filteredTimeline.map((item, index) => {
                                    const isWork = item.type === 'work';
                                    const isActive = safeIndex === index;
                                    const org = isWork ? item.company : item.institution;
                                    const role = isWork ? item.position : item.degree;

                                    return (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            type="button"
                                            onClick={() => setActiveIndex(index)}
                                            aria-current={isActive ? 'step' : undefined}
                                            className={`pf-bento shrink-0 snap-start w-60 p-4 text-left transition-colors duration-150 cursor-pointer ${
                                                isActive
                                                    ? 'border-[var(--pf-border-strong)] bg-[var(--pf-surface)]'
                                                    : 'bg-[var(--pf-bg)] hover:border-[var(--pf-border-strong)]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="text-[11px] font-mono text-[var(--pf-subtle)]">
                                                    {formatYear(item.startDate)} – {formatYear(item.endDate)}
                                                </span>
                                                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--pf-accent)]">
                                                    {isWork ? 'Work' : 'Edu'}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-semibold text-[var(--pf-ink)] truncate">
                                                {role}
                                            </h3>
                                            <p className="text-xs text-[var(--pf-muted)] truncate mt-0.5">
                                                {org}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Desktop Vertical Bento Stack */}
                            <div className="hidden md:flex flex-col gap-3">
                                {filteredTimeline.map((item, index) => {
                                    const isWork = item.type === 'work';
                                    const isActive = safeIndex === index;
                                    const org = isWork ? item.company : item.institution;
                                    const role = isWork ? item.position : item.degree;

                                    return (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            type="button"
                                            onClick={() => setActiveIndex(index)}
                                            aria-current={isActive ? 'step' : undefined}
                                            className={`pf-bento w-full text-left p-4 transition-colors duration-150 cursor-pointer ${
                                                isActive
                                                    ? 'border-[var(--pf-border-strong)] bg-[var(--pf-surface)]'
                                                    : 'bg-[var(--pf-bg)] hover:border-[var(--pf-border-strong)]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="text-[11px] font-mono text-[var(--pf-subtle)]">
                                                    {formatYear(item.startDate)} – {formatYear(item.endDate)}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${
                                                        isActive
                                                            ? 'bg-[var(--pf-surface-2)] text-[var(--pf-accent)] border-[var(--pf-border-strong)]'
                                                            : 'bg-transparent text-[var(--pf-subtle)] border-[var(--pf-border)]'
                                                    }`}
                                                >
                                                    {isWork ? 'Work' : 'Edu'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <OrgLogo logo={item.logo} name={org} isWork={isWork} />
                                                <div className="min-w-0">
                                                    <h3
                                                        className={`text-sm font-semibold truncate ${
                                                            isActive ? 'text-[var(--pf-ink)]' : 'text-[var(--pf-muted)]'
                                                        }`}
                                                    >
                                                        {role}
                                                    </h3>
                                                    <p className="text-xs text-[var(--pf-muted)] truncate mt-0.5">
                                                        {org}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Detail Bento Card */}
                        <div className="md:col-span-8 w-full">
                            <AnimatePresence mode="wait">
                                {(() => {
                                    const isWork = currentItem.type === 'work';
                                    const org = isWork ? currentItem.company : currentItem.institution;
                                    const role = isWork ? currentItem.position : currentItem.degree;
                                    const field = !isWork ? currentItem.field : '';
                                    const achievements = getAchievements(currentItem);

                                    return (
                                        <motion.div
                                            key={`${currentItem.type}-${currentItem.id}`}
                                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                                            transition={{ duration: 0.18, ease: 'easeOut' }}
                                            className="pf-bento p-6 sm:p-8"
                                        >
                                            {/* Progress Segments & Controls */}
                                            <div className="flex gap-1.5 w-full mb-5" role="group" aria-label="Timeline steps">
                                                {filteredTimeline.map((stepItem, dotIndex) => (
                                                    <button
                                                        key={`${stepItem.type}-${stepItem.id}-seg`}
                                                        type="button"
                                                        onClick={() => setActiveIndex(dotIndex)}
                                                        aria-label={`Jump to step ${dotIndex + 1}`}
                                                        className="h-1.5 flex-1 rounded-full bg-[var(--pf-border)] cursor-pointer overflow-hidden"
                                                    >
                                                        <span
                                                            className={`block h-full rounded-full transition-colors duration-150 ${
                                                                dotIndex <= safeIndex ? 'bg-[var(--pf-ink)]' : 'bg-transparent'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-[var(--pf-border)]">
                                                <span className="text-xs font-mono text-[var(--pf-subtle)]">
                                                    {String(safeIndex + 1).padStart(2, '0')} /{' '}
                                                    {String(filteredTimeline.length).padStart(2, '0')}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={safeIndex === 0}
                                                        onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                                                        aria-label="Previous timeline entry"
                                                        className="w-9 h-9 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg)] hover:border-[var(--pf-border-strong)] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center text-[var(--pf-ink)] transition-colors cursor-pointer"
                                                    >
                                                        <ChevronLeftIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={safeIndex === filteredTimeline.length - 1}
                                                        onClick={() =>
                                                            setActiveIndex((prev) =>
                                                                Math.min(filteredTimeline.length - 1, prev + 1)
                                                            )
                                                        }
                                                        aria-label="Next timeline entry"
                                                        className="w-9 h-9 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-bg)] hover:border-[var(--pf-border-strong)] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center text-[var(--pf-ink)] transition-colors cursor-pointer"
                                                    >
                                                        <ChevronRightIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Role & Organization Header */}
                                            <div className="flex items-start gap-4 mb-5">
                                                <OrgLogo
                                                    logo={currentItem.logo}
                                                    name={org}
                                                    isWork={isWork}
                                                    size="md"
                                                />
                                                <div className="min-w-0">
                                                    <h3 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-[var(--pf-ink)]">
                                                        {role}
                                                    </h3>
                                                    <p className="text-sm sm:text-base font-medium text-[var(--pf-accent)] mt-0.5">
                                                        {org}
                                                        {field ? ` · ${field}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date & Location */}
                                            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-[var(--pf-muted)] mb-7">
                                                {currentItem.location && (
                                                    <span className="pf-bento-subtle px-3 py-1.5 inline-flex items-center gap-1.5">
                                                        <MapPinIcon className="w-3.5 h-3.5 text-[var(--pf-subtle)]" aria-hidden="true" />
                                                        <span>{currentItem.location}</span>
                                                    </span>
                                                )}
                                                <span className="pf-bento-subtle px-3 py-1.5 inline-flex items-center gap-1.5">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-[var(--pf-subtle)]" aria-hidden="true" />
                                                    <span>
                                                        {formatMonthYear(currentItem.startDate)} –{' '}
                                                        {formatMonthYear(currentItem.endDate)}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Achievements */}
                                            {achievements.length > 0 && (
                                                <div className="mb-7">
                                                    <h4 className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--pf-subtle)] mb-3.5">
                                                        Key Responsibilities &amp; Outcomes
                                                    </h4>
                                                    <ul className="space-y-2.5">
                                                        {achievements.map((achievement, bulletIndex) => (
                                                            <li
                                                                key={bulletIndex}
                                                                className="flex items-start gap-3 text-sm text-[var(--pf-muted)] leading-relaxed"
                                                            >
                                                                <span
                                                                    aria-hidden="true"
                                                                    className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--pf-accent)] shrink-0"
                                                                />
                                                                <span>{achievement}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Skills */}
                                            {currentItem.skills && currentItem.skills.length > 0 && (
                                                <div className="pt-5 border-t border-[var(--pf-border)]">
                                                    <h4 className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--pf-subtle)] mb-3">
                                                        Technologies &amp; Focus Areas
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {currentItem.skills.map((skill) => (
                                                            <span
                                                                key={skill}
                                                                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--pf-surface-2)] text-[var(--pf-muted)] border border-[var(--pf-border)]"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })()}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
