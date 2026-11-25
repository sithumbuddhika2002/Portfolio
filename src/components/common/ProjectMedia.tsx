import React, { useEffect, useRef, useState } from 'react';
import type { Project } from '../../types/portfolio';
import { getOptimizedCloudinaryVideoUrl, getProjectMedia } from '../../utils/mediaUtils';

export interface ProjectMediaProps {
    project: Pick<Project, 'title' | 'image' | 'mediaType' | 'videoUrl'>;
    variant: 'card' | 'modal' | 'admin-thumb' | 'admin-preview';
    className?: string;
}

export const ProjectMedia: React.FC<ProjectMediaProps> = ({
    project,
    variant,
    className = '',
}) => {
    const { isVideo, src, poster } = getProjectMedia(project);
    const isInteractivePreview = variant === 'modal' || variant === 'admin-preview';
    const isAdminThumb = variant === 'admin-thumb';

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const [visibleSrc, setVisibleSrc] = useState<string | null>(null);
    const [failedVideoSrc, setFailedVideoSrc] = useState<string | null>(null);
    const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);

    const hasIntersectionObserver = typeof IntersectionObserver !== 'undefined';
    const shouldLoad = isInteractivePreview || !hasIntersectionObserver || loadedSrc === src;
    const isVisible = isInteractivePreview || !hasIntersectionObserver || visibleSrc === src;
    const hasVideoError = failedVideoSrc === src;
    const fallbackSrc = poster || project.image;
    const hasImageError = failedImageSrc === fallbackSrc;

    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Observe viewport intersection for cards so only visible videos load & play
    useEffect(() => {
        if (!isVideo || isInteractivePreview || isAdminThumb || !hasIntersectionObserver) {
            return;
        }

        const node = containerRef.current;
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                if (entry.isIntersecting) {
                    setLoadedSrc(src);
                    setVisibleSrc(src);
                } else {
                    setVisibleSrc((prev) => (prev === src ? null : prev));
                }
            },
            {
                rootMargin: '120px 0px',
                threshold: 0.15,
            }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [isVideo, isInteractivePreview, isAdminThumb, hasIntersectionObserver, src]);

    const optimizedUrl = isVideo
        ? getOptimizedCloudinaryVideoUrl(src, isInteractivePreview ? 'modal' : 'card')
        : '';

    // Autoplay / pause based on viewport visibility and motion preference
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isVideo || isAdminThumb || hasVideoError || !shouldLoad) {
            return;
        }

        if (variant === 'card' && prefersReducedMotion) {
            video.pause();
            return;
        }

        if (isVisible) {
            video.play().catch(() => {
                // Ignore autoplay rejections from browser power-saving or policy rules
            });
        } else {
            video.pause();
        }
    }, [isVideo, isAdminThumb, hasVideoError, shouldLoad, isVisible, variant, prefersReducedMotion, optimizedUrl]);

    if (!isVideo || hasVideoError) {
        if (!fallbackSrc || hasImageError) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-[var(--pf-surface-2,rgba(128,128,128,0.08))] text-xs font-mono text-[var(--pf-subtle,#6b7280)]">
                    No preview media
                </div>
            );
        }
        return (
            <img
                src={fallbackSrc}
                alt={project.title}
                loading={variant === 'card' || variant === 'admin-thumb' ? 'lazy' : undefined}
                onError={() => setFailedImageSrc(fallbackSrc)}
                className={className}
            />
        );
    }

    if (isAdminThumb) {
        return (
            <div className="relative w-full h-full">
                {poster ? (
                    <img
                        src={poster}
                        alt={project.title}
                        loading="lazy"
                        className={className}
                    />
                ) : (
                    <video
                        src={`${optimizedUrl}#t=0.1`}
                        muted
                        playsInline
                        preload="metadata"
                        disablePictureInPicture
                        onError={() => setFailedVideoSrc(src)}
                        className={className}
                    />
                )}
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-semibold tracking-wider uppercase">
                    VIDEO
                </span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full">
            <video
                ref={videoRef}
                src={shouldLoad ? optimizedUrl : undefined}
                poster={poster}
                muted
                loop
                playsInline
                autoPlay={isInteractivePreview && !prefersReducedMotion}
                preload={isInteractivePreview ? 'auto' : 'metadata'}
                controls={isInteractivePreview}
                disablePictureInPicture
                onError={() => setFailedVideoSrc(src)}
                className={className}
            />
        </div>
    );
};
