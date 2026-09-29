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

    // Interactive mouse spotlight position across hero section
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

    const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    // 3D perspective spring tilt for video container
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

    const handleVideoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleVideoMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // In-place Interactive Cyber Glitch Scramble for Name Morphing
    const originalName = profile.name || 'Sithum Buddhika';
    const [displayName, setDisplayName] = useState(originalName);
    const [isAlias, setIsAlias] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
    const scrambleTimerRef = useRef<number | null>(null);

    // Sync displayName if profile updates
    useEffect(() => {
        if (!isAlias && !isGlitching) {
            setDisplayName(profile.name || 'Sithum Buddhika');
        }
    }, [profile.name, isAlias, isGlitching]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (scrambleTimerRef.current) {
                clearInterval(scrambleTimerRef.current);
            }
        };
    }, []);

    const triggerGlitchScramble = (target: 'alias' | 'original') => {
        if (scrambleTimerRef.current) {
            clearInterval(scrambleTimerRef.current);
        }

        const targetIsAlias = target === 'alias';
        const fromTokens = targetIsAlias ? Array.from(originalName) : ALIAS_TOKENS;
        const toTokens = targetIsAlias ? ALIAS_TOKENS : Array.from(originalName);
        const finalString = targetIsAlias ? ALIAS_STRING : originalName;

        setIsGlitching(true);
        let step = 0;
        const totalSteps = 14;
        const intervalMs = 24;

        scrambleTimerRef.current = window.setInterval(() => {
            step++;
            const progress = step / totalSteps;

            // Chromatic jitter offset during glitch
            if (step < totalSteps) {
                setGlitchOffset({
                    x: (Math.random() - 0.5) * 3,
                    y: (Math.random() - 0.5) * 1.5,
                });
            }

            const currentLength = Math.round(
                fromTokens.length + (toTokens.length - fromTokens.length) * progress
            );
            const lockedCount = Math.floor(progress * toTokens.length);

            let scrambled = '';
            for (let i = 0; i < currentLength; i++) {
                if (i < lockedCount) {
                    scrambled += toTokens[i] || '';
                } else if (i < toTokens.length && toTokens[i] === ' ') {
                    scrambled += ' ';
                } else {
                    scrambled += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                }
            }

            setDisplayName(scrambled);

            if (step >= totalSteps) {
                if (scrambleTimerRef.current) clearInterval(scrambleTimerRef.current);
                setDisplayName(finalString);
                setIsAlias(targetIsAlias);
                setIsGlitching(false);
                setGlitchOffset({ x: 0, y: 0 });
            }
        }, intervalMs);
    };

    const handleNameMouseEnter = () => {
        if (!isAlias) {
            triggerGlitchScramble('alias');
        }
    };

    const handleNameMouseLeave = () => {
        if (isAlias) {
            triggerGlitchScramble('original');
        }
    };

    const handleNameClick = () => {
        triggerGlitchScramble(isAlias ? 'original' : 'alias');
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
        if (!videoRef.current) return;
        if (videoRef.current.ended) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().then(() => {
                setIsPlaying(true);
                triggerFeedback();
            }).catch(() => {});
        } else if (videoRef.current.paused) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
                triggerFeedback();
            }).catch(() => {});
        } else {
            videoRef.current.pause();
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
                className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 opacity-60 dark:opacity-90"
                style={{
                    background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(14, 165, 233, 0.1), rgba(99, 102, 241, 0.04), transparent 70%)`,
                }}
            />

            {/* Subtle Tech Grid Texture */}
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#38bdf80a_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

            {/* Harmonized Studio Lighting & Ambient Rim Glows */}
            <div className="absolute inset-0 -z-30 pointer-events-none overflow-hidden">
                {/* Left Cyan Typography Glow */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-primary-500/15 dark:bg-primary-500/10 rounded-full filter blur-[120px] animate-float" />
                
                {/* Right Soft Studio Rim Light behind Video */}
                <div 
                    className="absolute top-1/3 right-4 sm:right-24 w-72 h-72 sm:w-[480px] sm:h-[480px] bg-cyan-500/10 dark:bg-sky-500/10 rounded-full filter blur-[130px] animate-float" 
                    style={{ animationDelay: '2.5s' }} 
                />

                {/* Subtle Deep Indigo Bottom Ambiance */}
                <div 
                    className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full filter blur-[140px] animate-float" 
                    style={{ animationDelay: '4s' }} 
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
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display mt-2 tracking-tight">
                                <span 
                                    onMouseEnter={handleNameMouseEnter}
                                    onMouseLeave={handleNameMouseLeave}
                                    onClick={handleNameClick}
                                    style={{
                                        transform: isGlitching
                                            ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`
                                            : undefined,
                                    }}
                                    className={`gradient-text cursor-pointer relative inline-block transition-all duration-150 select-none ${
                                        isGlitching ? 'skew-x-1' : ''
                                    } hover:scale-[1.02]`}
                                    title="Hover or click to glitch morph"
                                >
                                    {displayName}
                                </span>
                            </h1>
                        </motion.div>

                        {/* Multiple Titles with TextRoll Animation */}
                        <motion.div
                            className="text-xl sm:text-2xl md:text-3xl font-semibold min-h-[2.5rem] flex items-center justify-center md:justify-start cursor-pointer select-none"
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
                                className="inline-block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
                            {/* Ambient Aura Halo emanates from behind the video */}
                            <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-primary-500/25 via-sky-400/15 to-indigo-500/20 rounded-full filter blur-2xl sm:blur-3xl -z-10 opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

                            {/* Main Video Presentation - Frameless with Seamless Edge Feathering */}
                            <div
                                onClick={togglePlay}
                                className="relative w-full h-full overflow-hidden cursor-pointer rounded-2xl"
                                style={{
                                    WebkitMaskImage: 'radial-gradient(ellipse 94% 94% at 50% 50%, black 65%, rgba(0,0,0,0.85) 82%, transparent 100%)',
                                    maskImage: 'radial-gradient(ellipse 94% 94% at 50% 50%, black 65%, rgba(0,0,0,0.85) 82%, transparent 100%)',
                                }}
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    preload="auto"
                                    poster="/hero-poster.webp"
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={() => setIsPlaying(false)}
                                >
                                    <source src="/hero.mp4" type="video/mp4" />
                                    <source src="/videos/hero.mp4" type="video/mp4" />
                                    {/* Fallback image */}
                                    <img
                                        src={profile.image}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
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
                                        <div className="p-4 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-2xl">
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
                                className="absolute bottom-6 -left-4 sm:bottom-8 sm:-left-6 z-20 hidden xs:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl border border-gray-200/50 dark:border-white/15 text-gray-800 dark:text-gray-100 text-xs font-medium shadow-xl hover:scale-105 hover:border-primary-500/50 transition-all duration-300 group/badge"
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
