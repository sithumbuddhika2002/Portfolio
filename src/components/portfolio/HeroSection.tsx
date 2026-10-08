import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { HeroPortrait } from './HeroPortrait';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = ({ signatureRef, signatureHandoff = false }: {
    signatureRef?: RefObject<HTMLImageElement | null>;
    signatureHandoff?: boolean;
}) => {
    const signatureManagedOnMount = useRef(signatureHandoff);
    const { data: { profile } } = usePortfolioData();
    const heroRef = useRef<HTMLElement>(null);
    const titles = profile.titles?.length ? profile.titles : [profile.title];

    useLayoutEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const stage = hero.querySelector<HTMLElement>('.hero-stage')!;
        const word = hero.querySelector<HTMLElement>('.hero-word-reveal')!;
        let disposed = false;
        let resizeFrame = 0;
        // Measure the font off-DOM, once per font load. Resize only writes the
        // final size; it no longer shrinks/re-expands the live heading to measure it.
        const metrics = document.createElement('canvas').getContext('2d');
        let wordRatio = 2.7;
        const measureFont = () => {
            if (disposed || !metrics) return;
            const style = getComputedStyle(word);
            metrics.font = `${style.fontWeight} 100px ${style.fontFamily}`;
            wordRatio = metrics.measureText('SITHUM').width / 100 - 6 * 0.027;
        };
        const fitWord = () => {
            if (disposed) return;
            const isMobile = window.innerWidth < 768;
            const widthFactor = isMobile ? 0.98 : 0.64;
            const widthLimit = (stage.clientWidth * widthFactor) / wordRatio;
            const heightLimit = stage.clientHeight * (isMobile ? 0.56 : 0.48);
            const finalSize = Math.min(widthLimit, heightLimit);
            word.style.fontSize = `${finalSize}px`;
        };
        const queueFit = () => {
            if (disposed) return;
            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(fitWord);
        };
        const fontReady = () => { measureFont(); queueFit(); };
        const resize = new ResizeObserver(queueFit);
        resize.observe(stage);
        measureFont();
        fitWord();
        void document.fonts.ready.then(fontReady);
        document.fonts.addEventListener('loadingdone', fontReady);
        const media = gsap.matchMedia();
        const context = gsap.context(() => {
            media.add('(prefers-reduced-motion: no-preference)', () => {
                const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
                entrance.from('.hero-word-reveal', { yPercent: 24, opacity: 0, clipPath: 'inset(100% 0 0 0)', duration: 1.15 })
                    .from('.hero-subject-reveal', { y: 50, scale: 1.03, opacity: 0, duration: 1.2 }, 0.18)
                    .from('.hero-content-reveal', { y: 20, opacity: 0, duration: 0.75, stagger: 0.1 }, 0.68);
                if (!signatureManagedOnMount.current) {
                    entrance.from('.hero-signature', { y: 16, opacity: 0, clipPath: 'inset(0 100% 0 0)', duration: 0.9 }, 0.6);
                }
            });
            // Native touch scrolling stays lightweight; desktop retains subtle depth.
            media.add('(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
                gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: 0.45 } })
                    .to('.hero-word-scroll', { y: -48, ease: 'none' }, 0)
                    .to('.hero-subject-scroll', { y: 18, ease: 'none' }, 0);
            });
            media.add('(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
                const word = hero.querySelector('.hero-word-pointer');
                const subject = hero.querySelector('.hero-subject-pointer');
                const wx = gsap.quickTo(word, 'x', { duration: 0.65, ease: 'power3.out' });
                const wy = gsap.quickTo(word, 'y', { duration: 0.65, ease: 'power3.out' });
                const sx = gsap.quickTo(subject, 'x', { duration: 0.8, ease: 'power3.out' });
                const sy = gsap.quickTo(subject, 'y', { duration: 0.8, ease: 'power3.out' });
                let bounds = hero.getBoundingClientRect();
                let documentTop = bounds.top + window.scrollY;
                const enter = () => { bounds = hero.getBoundingClientRect(); documentTop = bounds.top + window.scrollY; };
                const move = (event: PointerEvent) => {
                    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
                    const y = ((event.clientY + window.scrollY - documentTop) / bounds.height - 0.5) * 2;
                    wx(-x * 5); wy(-y * 4); sx(x * 10); sy(y * 8);
                };
                const leave = () => { wx(0); wy(0); sx(0); sy(0); };
                hero.addEventListener('pointerenter', enter);
                hero.addEventListener('pointermove', move);
                hero.addEventListener('pointerleave', leave);
                window.addEventListener('resize', enter, { passive: true });
                return () => {
                    hero.removeEventListener('pointerenter', enter);
                    hero.removeEventListener('pointermove', move);
                    hero.removeEventListener('pointerleave', leave);
                    window.removeEventListener('resize', enter);
                };
            });
        }, hero);
        return () => { disposed = true; cancelAnimationFrame(resizeFrame); resize.disconnect(); document.fonts.removeEventListener('loadingdone', fontReady); media.revert(); context.revert(); };
    }, []);

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
        <section id="home" ref={heroRef} className="cinematic-hero" aria-labelledby="hero-name">
            <picture className="hero-atmosphere" aria-hidden="true">
                <source media="(max-width: 767px)" srcSet="/images/hero-atmosphere-mobile.webp" />
                <source media="(max-width: 1023px)" srcSet="/images/hero-atmosphere-tablet.webp" />
                <img src="/images/hero-atmosphere.webp" width="1672" height="941" alt="" decoding="async" />
            </picture>
            <div className="hero-side-note" aria-hidden="true">Foresight<br />Engineering</div>
            <div className="hero-side-note hero-side-note--right" aria-hidden="true">PEAKSORA</div>
            <div className="hero-stage">
                <div className="hero-word-scroll" aria-hidden="true">
                    <div className="hero-word-pointer"><div className="hero-word-reveal">SITHUM</div></div>
                </div>
                <div className="hero-subject-scroll">
                    <div className="hero-subject-pointer"><div className="hero-subject-reveal">
                        <HeroPortrait name={profile.name} />
                    </div></div>
                </div>
            </div>
            <div className="hero-topline hero-content-reveal">
                <span className="hero-topline-role">{titles[0]?.split('|')[0]?.trim()}</span>
            </div>
            <div className="hero-information hero-info-scroll">
                <div className="hero-identity">
                    <img ref={signatureRef} style={signatureHandoff ? { visibility: 'hidden' } : undefined} className="hero-signature" src="/signature.png" alt={`${profile.name}'s handwritten signature`} width="1448" height="1086" />
                    <h1 id="hero-name" className="hero-content-reveal">{profile.name}</h1>
                    <p className="hero-identity-caption hero-content-reveal">{titles[0]}</p>
                </div>
                <div className="hero-cta-area">
                    <p className="hero-cta-caption">Let’s build<br />something great</p>
                    <div className="hero-actions hero-content-reveal">
                        <a className="hero-button hero-button-primary" href="#contact">Get In Touch <span aria-hidden="true">↗</span></a>
                        {profile.resumeUrl && <button className="hero-button hero-button-secondary" type="button" onClick={handleResumeDownload}>Download CV <span aria-hidden="true">↓</span></button>}
                    </div>
                </div>
            </div>

        </section>
    );
};

