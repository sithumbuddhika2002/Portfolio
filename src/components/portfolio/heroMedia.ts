// Reuse the buffered element through Strict Mode setup and route remounts.
// A full browser refresh starts a fresh playback/intro session.
let portraitVideo: HTMLVideoElement | undefined;
export const heroIntro = { completed: false };

export function getHeroVideo() {
    if (!portraitVideo) {
        portraitVideo = document.createElement('video');
        portraitVideo.muted = true;
        portraitVideo.playsInline = true;
        portraitVideo.preload = 'auto';
        portraitVideo.className = 'hero-video-source';
        portraitVideo.setAttribute('aria-hidden', 'true');
        portraitVideo.src = window.matchMedia('(max-width: 767px)').matches
            ? '/videos/hero-packed-mobile.mp4'
            : '/videos/hero-packed-desktop.mp4';
        portraitVideo.load();
    }
    return portraitVideo;
}
