import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
    ArrowDownIcon, 
    PlayIcon, 
    PauseIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { TextRoll } from '@/components/ui/text-roll';

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#01X$%&@ヅ亗๛';
const ALIAS_TOKENS = ['ヅ', 'M͜͡r', '๛', 'S', 'i', 't', 'h', 'u', 'm', '亗'];
const ALIAS_STRING = 'ヅM͜͡r๛Sithum亗';

export const HeroSection: React.FC = () => {
    const { data } = usePortfolioData();
    const { profile } = data;

    const [isPlaying, setIsPlaying] = useState(true);
    const [showPlayPauseFeedback, setShowPlayPauseFeedback] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const heroRef = useRef<HTMLElement>(null);
    const userPausedRef = useRef(false);

    // Interactive mouse spotlight position across hero section (using rAF to avoid layout thrashing)
    const spotlightRef = useRef<HTMLDivElement>(null);
    const isHeroMovingRef = useRef(false);

    const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!spotlightRef.current || isHeroMovingRef.current) return;
        isHeroMovingRef.current = true;
        const clientX = e.clientX;
        const clientY = e.clientY;
        const currentTarget = e.currentTarget;
        requestAnimationFrame(() => {
            if (spotlightRef.current && currentTarget) {
                const rect = currentTarget.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                spotlightRef.current.style.background = `radial-gradient(750px circle at ${x}px ${y}px, rgba(14, 165, 233, 0.1), rgba(99, 102, 241, 0.04), transparent 70%)`;
            }
            isHeroMovingRef.current = false;
        });
    };

    // 3D perspective spring tilt for video container
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

    const isVideoMovingRef = useRef(false);
    const handleVideoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isVideoMovingRef.current) return;
        isVideoMovingRef.current = true;
        const clientX = e.clientX;
        const clientY = e.clientY;
        const currentTarget = e.currentTarget;
        requestAnimationFrame(() => {
            if (currentTarget) {
                const rect = currentTarget.getBoundingClientRect();
                const width = rect.width;
                const height = rect.height;
                x.set((clientX - rect.left) / width - 0.5);
                y.set((clientY - rect.top) / height - 0.5);
            }
            isVideoMovingRef.current = false;
        });
    };

    const handleVideoMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // In-place Interactive Cyber Glitch Scramble for Name Morphing
    const originalName = profile.name || 'Sithum Buddhika';
    const [displayName, setDisplayName] = useState(originalName);
    const [isGlitching, setIsGlitching] = useState(false);
    const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
    const isHoveredRef = useRef(false);
    const scrambleTimerRef = useRef<number | null>(null);

    // Sync displayName if profile updates while not hovered
    useEffect(() => {
        if (!isHoveredRef.current && !isGlitching) {
            setDisplayName(profile.name || 'Sithum Buddhika');
        }
    }, [profile.name, isGlitching]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (scrambleTimerRef.current) {
                clearInterval(scrambleTimerRef.current);
            }
        };
    }, []);

    // Optimize performance: pause video playback when Hero is scrolled out of view, resume when visible
    useEffect(() => {
        const heroEl = heroRef.current;
        const videoEl = videoRef.current;
        if (!heroEl || !videoEl) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!userPausedRef.current) {
                        videoEl.play().catch(() => {});
                    }
                } else {
                    videoEl.pause();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(heroEl);
        return () => observer.disconnect();
    }, []);

    const triggerGlitchScramble = (target: 'alias' | 'original') => {
        if (scrambleTimerRef.current) {
            clearInterval(scrambleTimerRef.current);
            scrambleTimerRef.current = null;
        }

        const targetIsAlias = target === 'alias';

        setIsGlitching(true);
        let step = 0;
        const totalSteps = 12;
        const intervalMs = 24;

        const fromChars = Array.from(displayName);
        const toChars = targetIsAlias ? ALIAS_TOKENS : Array.from(originalName);

        scrambleTimerRef.current = window.setInterval(() => {
            step++;
            const progress = step / totalSteps;

            // Chromatic jitter offset during glitch
            if (step < totalSteps) {
                setGlitchOffset({
                    x: (Math.random() - 0.5) * 2.5,
                    y: (Math.random() - 0.5) * 1.2,
                });
            }

            const currentLength = Math.round(
                fromChars.length + (toChars.length - fromChars.length) * progress
            );
            const lockedCount = Math.floor(progress * toChars.length);

            let scrambled = '';
            for (let i = 0; i < currentLength; i++) {
                if (i < lockedCount) {
                    scrambled += toChars[i] || '';
                } else if (i < toChars.length && toChars[i] === ' ') {
                    scrambled += ' ';
                } else {
                    scrambled += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                }
            }

            setDisplayName(scrambled);

            if (step >= totalSteps) {
                if (scrambleTimerRef.current) {
                    clearInterval(scrambleTimerRef.current);
                    scrambleTimerRef.current = null;
                }
                // Enforce strictly: alias ONLY when cursor is hovered!
                const shouldBeAlias = isHoveredRef.current;
                setDisplayName(shouldBeAlias ? ALIAS_STRING : originalName);
                setIsGlitching(false);
                setGlitchOffset({ x: 0, y: 0 });

                // If cursor state flipped while animating, smoothly correct to target
                if (shouldBeAlias !== targetIsAlias) {
                    triggerGlitchScramble(shouldBeAlias ? 'alias' : 'original');
                }
            }
        }, intervalMs);
    };

    const handleNameMouseEnter = () => {
        isHoveredRef.current = true;
        triggerGlitchScramble('alias');
    };

    const handleNameMouseLeave = () => {
        isHoveredRef.current = false;
        triggerGlitchScramble('original');
    };

    // Multiple titles rotation using TextRoll animation
    const titles = (profile.titles && profile.titles.length > 0)
        ? profile.titles
        : (profile.title ? [profile.title] : ['Full Stack Developer & Designer']);

    const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

    // Auto-rotate titles every 3.8 seconds with TextRoll animation
    useEffect(() => {
        if (titles.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
        }, 3800);

        return () => clearInterval(interval);
    }, [titles.length]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = true;
        video.defaultMuted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch(() => {
                    // Autoplay might be deferred or restricted on initial load
                    setIsPlaying(false);
                });
        }
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused || video.ended) {
            userPausedRef.current = false;
            video.play().then(() => {
                setIsPlaying(true);
                triggerFeedback();
            }).catch(() => {});
        } else {
            userPausedRef.current = true;
            video.pause();
            setIsPlaying(false);
            triggerFeedback();
        }
    };

    const triggerFeedback = () => {
        setShowPlayPauseFeedback(true);
        setTimeout(() => setShowPlayPauseFeedback(false), 800);
    };

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
            ref={heroRef}
            onMouseMove={handleHeroMouseMove}
            className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white dark:bg-[#080b11] transition-colors duration-500 pt-24 pb-16 sm:py-20 md:py-24"
        >
            {/* Interactive Dynamic Mouse Spotlight */}
            <div
                ref={spotlightRef}
                className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 opacity-60 dark:opacity-90"
                style={{
                    background: 'radial-gradient(750px circle at -1000px -1000px, rgba(14, 165, 233, 0.1), rgba(99, 102, 241, 0.04), transparent 70%)',
                }}
            />

            {/* Subtle Tech Grid Texture */}
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#38bdf80a_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

            {/* Harmonized Studio Lighting & Ambient Rim Glows - Isolated with containment and zero filter blur */}
            <div className="absolute inset-0 -z-30 pointer-events-none overflow-hidden" style={{ contain: 'strict' }}>
                {/* Left Cyan Typography Glow */}
                <div 
                    className="absolute top-1/4 -left-20 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none" 
                    style={{
                        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.16) 0%, rgba(14, 165, 233, 0.05) 45%, transparent 70%)',
                    }}
                />
                
                {/* Right Soft Studio Rim Light behind Video */}
                <div 
                    className="absolute top-1/3 right-4 sm:right-24 w-72 h-72 sm:w-[480px] sm:h-[480px] rounded-full pointer-events-none" 
                    style={{
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, rgba(14, 165, 233, 0.04) 45%, transparent 70%)',
                    }}
                />

                {/* Subtle Deep Indigo Bottom Ambiance */}
                <div 
                    className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full pointer-events-none" 
                    style={{
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 70%)',
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
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
                            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display mt-2 tracking-tight">
                                <span 
                                    onMouseEnter={handleNameMouseEnter}
                                    onMouseLeave={handleNameMouseLeave}
                                    style={{
                                        transform: isGlitching
                                            ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`
                                            : undefined,
                                    }}
                                    className={`gradient-text cursor-pointer relative inline-block whitespace-nowrap transition-all duration-150 select-none ${
                                        isGlitching ? 'skew-x-1' : ''
                                    } hover:scale-[1.02]`}
                                    title="Hover to reveal alias"
                                >
                                    {displayName}
                                </span>
                            </h1>
                        </motion.div>

                        {/* Multiple Titles with TextRoll Animation */}
                        <motion.div
                            className="text-xl sm:text-2xl md:text-3xl font-semibold min-h-[2.5rem] flex items-center justify-center md:justify-start cursor-pointer select-none overflow-hidden whitespace-nowrap"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
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
                                className="inline-block whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                {titles[currentTitleIndex % titles.length] || profile.title || ''}
                            </TextRoll>
                        </motion.div>

                        <motion.p
                            className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            {profile.bio}
                        </motion.p>

                        <motion.div
                            className="flex flex-wrap gap-4 justify-center md:justify-start pt-2"
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

                    {/* Professional Video Showcase (Frameless, Seamlessly Blended & Highly Interactive) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex justify-center items-center relative [perspective:1000px]"
                    >
                        <motion.div
                            style={{
                                rotateX,
                                rotateY,
                                transformStyle: 'preserve-3d',
                            }}
                            onMouseMove={handleVideoMouseMove}
                            onMouseLeave={handleVideoMouseLeave}
                            className="relative group w-[260px] xs:w-[285px] sm:w-[325px] md:w-[325px] lg:w-[370px] xl:w-[410px] aspect-[9/16] max-h-[62vh] md:max-h-[580px] lg:max-h-[640px] select-none"
                        >
                            {/* Ambient Aura Halo emanates from behind the video - Pure radial gradient (Zero filter blur overhead) */}
                            <div 
                                className="absolute -inset-6 sm:-inset-8 rounded-full -z-10 opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.12) 45%, transparent 70%)',
                                }}
                            />

                            {/* Main Video Presentation - Frameless with Seamless Edge Feathering */}
                            <div
                                onClick={togglePlay}
                                className="relative w-full h-full overflow-hidden cursor-pointer rounded-2xl transform-gpu [backface-visibility:hidden]"
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    poster="/hero-poster.webp"
                                    className="w-full h-full object-cover rounded-2xl transform-gpu [backface-visibility:hidden]"
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                >
                                    <source src="/hero.webm" type="video/webm" />
                                    <source src="/hero.mp4" type="video/mp4" />
                                    {/* Fallback image */}
                                    <img
                                        src={profile.image}
                                        alt={profile.name}
                                        className="w-full h-full object-cover rounded-2xl"
                                        loading="lazy"
                                    />
                                </video>

                                {/* Seamless Bottom Floor Dissolve (Suit base melts naturally into hero background) */}
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white dark:from-[#080b11] via-white/80 dark:via-[#080b11]/80 via-35% to-transparent pointer-events-none transition-colors duration-500" />

                                {/* Side & Top Ambient Soft Edge Feathering */}
                                <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white/70 dark:from-[#080b11]/70 to-transparent pointer-events-none transition-colors duration-500" />
                                <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/70 dark:from-[#080b11]/70 to-transparent pointer-events-none transition-colors duration-500" />
                                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/60 dark:from-[#080b11]/60 to-transparent pointer-events-none transition-colors duration-500" />

                                {/* Dynamic Specular Light Glare (interactive sheen that moves with mouse) */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Interactive Play/Pause Center Indicator */}
                                {showPlayPauseFeedback && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                                    >
                                        <div className="p-4 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white shadow-2xl">
                                            {isPlaying ? (
                                                <PlayIcon className="w-8 h-8 translate-x-0.5 text-primary-400" />
                                            ) : (
                                                <PauseIcon className="w-8 h-8 text-primary-400" />
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Floating Interactive Experience / Role Badge */}
                            <motion.div
                                className="absolute bottom-6 -left-4 sm:bottom-8 sm:-left-6 z-20 hidden xs:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-white/15 text-gray-800 dark:text-gray-100 text-xs font-medium shadow-xl hover:scale-105 hover:border-primary-500/50 transition-all duration-300 group/badge transform-gpu"
                                style={{ transform: 'translateZ(40px)' }}
                                whileHover={{ y: -3 }}
                            >
                                <div className="p-1 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 group-hover/badge:scale-110 transition-transform">
                                    <BoltIcon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white leading-tight">Software Engineer</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">SLIIT • Foresight Eng</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    <motion.a
                        href="#about"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <span className="text-xs uppercase tracking-widest mb-1.5 opacity-80">Scroll Down</span>
                        <ArrowDownIcon className="w-4 h-4" />
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};
