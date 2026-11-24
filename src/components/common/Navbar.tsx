import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../../contexts/DarkModeContext';

const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Skills', href: '#skills', id: 'skills' },
    { name: 'Projects', href: '#projects', id: 'projects' },
    { name: 'Experience', href: '#experience', id: 'experience' },
    { name: 'Contact', href: '#contact', id: 'contact' },
];

export const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const { isDark, toggle } = useDarkMode();
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const handleScroll = () => {
            const nextScrolled = window.scrollY > 40;
            setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const sectionIds = navLinks.map((link) => link.id);
        const elements = sectionIds
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length > 0 && visible[0].target.id) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                rootMargin: '-25% 0px -55% 0px',
                threshold: [0.05, 0.2, 0.5],
            }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    const scrollToSection = (href: string) => {
        setIsOpen(false);
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
            });
        }
    };

    // Over the always-dark Hero, keep Hero-compatible dark-surface ink regardless of theme
    const navSurfaceClass = scrolled
        ? 'bg-[var(--pf-bg)] border-b border-[var(--pf-border)] py-3'
        : 'bg-transparent border-b border-transparent py-4 sm:py-5';

    const brandClass = scrolled
        ? 'text-[var(--pf-ink)]'
        : 'text-[#E5E5E1]';

    const controlBtnClass = scrolled
        ? 'border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-ink)] hover:border-[var(--pf-border-strong)] hover:bg-[var(--pf-surface-2)]'
        : 'border border-[#505258] bg-[#090B0F]/60 text-[#E5E5E1] hover:bg-[#191E26] hover:border-[#7B808A]';

    return (
        <nav
            aria-label="Primary navigation"
            className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${navSurfaceClass}`}
        >
            <div className="max-w-[78rem] mx-auto px-5 sm:px-8 lg:px-12">
                <div className="flex items-center justify-between gap-4">
                    {/* Personal Mark */}
                    <div className="flex flex-1 items-center justify-start min-w-0">
                        <a
                            href="#home"
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection('#home');
                            }}
                            className={`inline-flex items-baseline gap-2 font-display text-sm sm:text-[15px] font-semibold tracking-[0.12em] uppercase truncate transition-colors duration-150 ${brandClass}`}
                        >
                            <span>Sithum</span>
                            <span className={scrolled ? 'text-[var(--pf-muted)] font-normal' : 'text-[#A7A9AF] font-normal'}>
                                Buddhika
                            </span>
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8">
                        {navLinks.map((link) => {
                            const isActive = activeSection === link.id;
                            const linkColorClass = scrolled
                                ? isActive
                                    ? 'text-[var(--pf-ink)]'
                                    : 'text-[var(--pf-muted)] hover:text-[var(--pf-ink)]'
                                : isActive
                                    ? 'text-[#E5E5E1]'
                                    : 'text-[#A7A9AF] hover:text-[#E5E5E1]';

                            return (
                                <a
                                    key={link.id}
                                    href={link.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection(link.href);
                                    }}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`relative py-1.5 text-[13px] font-medium tracking-[0.04em] whitespace-nowrap transition-colors duration-150 ${linkColorClass}`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <span
                                            aria-hidden="true"
                                            className={`absolute left-0 right-0 bottom-0 h-px ${
                                                scrolled ? 'bg-[var(--pf-ink)]' : 'bg-[#E5E5E1]'
                                            }`}
                                        />
                                    )}
                                </a>
                            );
                        })}
                    </div>

                    {/* Right Controls */}
                    <div className="flex flex-1 items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={toggle}
                            className={`w-10 h-10 rounded-xl inline-flex items-center justify-center transition-colors duration-150 cursor-pointer ${controlBtnClass}`}
                            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                        >
                            {isDark ? (
                                <SunIcon className="w-[18px] h-[18px]" />
                            ) : (
                                <MoonIcon className="w-[18px] h-[18px]" />
                            )}
                        </button>

                        <div className="md:hidden flex items-center">
                            <button
                                type="button"
                                onClick={() => setIsOpen((prev) => !prev)}
                                className={`w-10 h-10 rounded-xl inline-flex items-center justify-center transition-colors duration-150 cursor-pointer ${controlBtnClass}`}
                                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                                aria-expanded={isOpen}
                                aria-controls="mobile-nav-menu"
                            >
                                {isOpen ? (
                                    <XMarkIcon className="w-5 h-5" />
                                ) : (
                                    <Bars3Icon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 -z-10 md:hidden"
                            aria-hidden="true"
                        />
                        <motion.div
                            id="mobile-nav-menu"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            className="md:hidden mt-3 mx-5 rounded-2xl overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)]"
                        >
                            <div className="divide-y divide-[var(--pf-border)] flex flex-col">
                                {navLinks.map((link) => {
                                    const isActive = activeSection === link.id;
                                    return (
                                        <a
                                            key={link.id}
                                            href={link.href}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                scrollToSection(link.href);
                                            }}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={`w-full min-h-[46px] px-5 py-3 flex items-center justify-between text-sm font-medium transition-colors duration-150 ${
                                                isActive
                                                    ? 'text-[var(--pf-ink)] bg-[var(--pf-surface-2)]'
                                                    : 'text-[var(--pf-muted)] hover:text-[var(--pf-ink)] hover:bg-[var(--pf-surface-2)]'
                                            }`}
                                        >
                                            <span>{link.name}</span>
                                            {isActive && (
                                                <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--pf-accent)]">
                                                    Active
                                                </span>
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};
