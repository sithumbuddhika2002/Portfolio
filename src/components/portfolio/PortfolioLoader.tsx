import { useId, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { gsap } from 'gsap';
import './PortfolioLoader.css';

interface PortfolioLoaderProps {
    exiting: boolean;
    destinationRef: RefObject<HTMLImageElement | null>;
    onSequenceComplete: (complete: boolean) => void;
    onDismiss: (complete: boolean) => void;
}

export const PortfolioLoader = ({ exiting, destinationRef, onSequenceComplete, onDismiss }: PortfolioLoaderProps) => {
    const maskId = useId().replace(/:/g, '');
    const overlayRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const signatureRef = useRef<SVGSVGElement>(null);
    const imageReady = useRef(false);
    const artworkBounds = useRef({ left: 0, top: 0, right: 1, bottom: 1 });

    useLayoutEffect(() => {
        const signature = signatureRef.current!;
        const regions = signature.querySelectorAll('.portfolio-loader__region');
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const image = new Image();
        let started = false;
        let disposed = false;
        let sequence: gsap.core.Timeline | undefined;
        const context = gsap.context(() => {}, overlayRef);
        const finish = () => { if (!disposed) onSequenceComplete(true); };
        const reveal = () => {
            if (started || disposed) return;
            started = true;
            imageReady.current = true;
            window.clearTimeout(fallback);
            try {
                // Measure transparent padding once, at low resolution. On mobile
                // the image box slightly overhangs while the actual ink remains visible.
                const canvas = document.createElement('canvas');
                canvas.width = 181;
                canvas.height = 136;
                const pixels = canvas.getContext('2d');
                if (pixels) {
                    pixels.drawImage(image, 0, 0, canvas.width, canvas.height);
                    const { data } = pixels.getImageData(0, 0, canvas.width, canvas.height);
                    let left = canvas.width, top = canvas.height, right = 0, bottom = 0;
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            if (data[(y * canvas.width + x) * 4 + 3] > 0) {
                                left = Math.min(left, x); top = Math.min(top, y);
                                right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
                            }
                        }
                    }
                    if (right > left) artworkBounds.current = {
                        left: left / canvas.width, top: top / canvas.height,
                        right: right / canvas.width, bottom: bottom / canvas.height,
                    };
                }
                context.add(() => {
                    gsap.set(signature, { opacity: 1 });
                    if (motion.matches) {
                        gsap.set(regions, { attr: { width: 1448 } });
                        finish();
                        return;
                    }
                    // Broad, overlapping regions reveal the PNG's loop, descender,
                    // connected letters and flourish. These are not inferred pen paths.
                    sequence = gsap.timeline({ onComplete: finish })
                        .to(regions[0], { attr: { width: 1448 }, duration: 0.65, ease: 'power2.inOut' }, 0)
                        .to(regions[1], { attr: { width: 1448 }, duration: 0.65, ease: 'power2.inOut' }, 0.48)
                        .to(regions[2], { attr: { width: 1448 }, duration: 0.85, ease: 'power2.inOut' }, 0.95)
                        .to(regions[3], { attr: { width: 1448 }, duration: 0.55, ease: 'power2.inOut' }, 1.4)
                        .to({}, { duration: 0.25 });
                });
            } catch {
                finish();
            }
        };
        const fail = () => {
            if (started || disposed) return;
            started = true;
            window.clearTimeout(fallback);
            finish();
        };
        const updateMotion = () => { if (motion.matches) sequence?.progress(1); };
        const fallback = window.setTimeout(fail, 8000);
        image.onload = reveal;
        image.onerror = fail;
        image.src = '/signature.png';
        motion.addEventListener('change', updateMotion);
        if (image.complete) {
            if (image.naturalWidth > 0) reveal();
            else fail();
        }
        return () => {
            disposed = true;
            window.clearTimeout(fallback);
            image.onload = null;
            image.onerror = null;
            motion.removeEventListener('change', updateMotion);
            context.revert();
        };
    }, [onSequenceComplete]);

    useLayoutEffect(() => {
        if (!exiting) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const signature = signatureRef.current!;
        let transition: gsap.core.Timeline | undefined;
        let finished = false;
        const context = gsap.context(() => {}, overlayRef);
        const finish = () => {
            if (finished) return;
            finished = true;
            window.clearTimeout(watchdog);
            onDismiss(true);
        };
        const fadeOnly = () => {
            if (finished) return;
            transition?.kill();
            context.add(() => {
                transition = gsap.timeline({ onComplete: finish })
                    .to(overlayRef.current, { opacity: 0, duration: motion.matches ? 0 : 0.25 });
            });
        };
        const watchdog = window.setTimeout(finish, 2500);
        // Wait until the newly mounted hero has completed its layout effects.
        const frame = requestAnimationFrame(() => {
            try {
                const target = destinationRef.current;
                if (!target || !imageReady.current || motion.matches) { fadeOnly(); return; }
                const from = signature.getBoundingClientRect();
                const to = target.getBoundingClientRect();
                const ink = artworkBounds.current;
                // Preserve the existing layout on short/landscape viewports:
                // fade in place when a full, visible landing is not possible.
                if (!from.width || !to.width || to.left + to.width * ink.left < 0 ||
                    to.top + to.height * ink.top < 0 ||
                    to.left + to.width * ink.right > window.innerWidth ||
                    to.top + to.height * ink.bottom > window.innerHeight) {
                    fadeOnly();
                    return;
                }
                context.add(() => {
                    gsap.set(signature, {
                        position: 'fixed', left: from.left, top: from.top,
                        width: from.width, height: from.height, maxWidth: 'none', maxHeight: 'none',
                        transformOrigin: '0 0',
                    });
                    transition = gsap.timeline({ onComplete: finish })
                        .to(backdropRef.current, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 0)
                        .to(signature, {
                            x: to.left - from.left, y: to.top - from.top,
                            scale: to.width / from.width,
                            duration: window.innerWidth < 768 ? 0.95 : 1.15,
                            ease: 'power3.inOut',
                        }, 0);
                });
            } catch {
                finish();
            }
        });
        // If geometry changes mid-flight, a short fade is safer than a stale landing.
        const interrupt = () => { try { fadeOnly(); } catch { finish(); } };
        const updateMotion = () => { if (motion.matches) interrupt(); };
        window.addEventListener('resize', interrupt);
        window.addEventListener('scroll', interrupt, { passive: true });
        motion.addEventListener('change', updateMotion);
        return () => {
            finished = true;
            cancelAnimationFrame(frame);
            window.clearTimeout(watchdog);
            window.removeEventListener('resize', interrupt);
            window.removeEventListener('scroll', interrupt);
            motion.removeEventListener('change', updateMotion);
            context.revert();
        };
    }, [exiting, destinationRef, onDismiss]);

    return (
        <div ref={overlayRef} className="portfolio-loader" role="status" aria-label="Loading portfolio" aria-live="polite">
            <div ref={backdropRef} className="portfolio-loader__backdrop bg-gray-950" />
            <svg ref={signatureRef} className="portfolio-loader__signature" viewBox="0 0 1448 1086" aria-hidden="true">
                <defs>
                    <clipPath id={`${maskId}-loop`}><path d="M0 0H740L675 565L0 640Z" /></clipPath>
                    <clipPath id={`${maskId}-descender`}><path d="M0 635L680 560L810 1086H0Z" /></clipPath>
                    <clipPath id={`${maskId}-letters`}><path d="M735 0H1448V545L675 800L670 560Z" /></clipPath>
                    <clipPath id={`${maskId}-flourish`}><path d="M675 795L1448 540V1086H800Z" /></clipPath>
                    <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1448" height="1086" style={{ maskType: 'luminance' }}>
                        {['loop', 'descender', 'letters', 'flourish'].map(region => (
                            <g key={region} clipPath={`url(#${maskId}-${region})`}>
                                <rect className="portfolio-loader__region" width="0" height="1086" fill="white" />
                            </g>
                        ))}
                    </mask>
                </defs>
                <image href="/signature.png" width="1448" height="1086" mask={`url(#${maskId})`} />
            </svg>
        </div>
    );
};
