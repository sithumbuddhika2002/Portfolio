import { useEffect, useRef, useState } from 'react';

/** One H.264 stream carries color (left) and alpha (right), so the matte
 * cannot drift out of sync. WebGL only composites preprocessed pixels. */
export function HeroPortrait({ name }: { name: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!video || !canvas || !container) return;
        // Match the browser compositor's premultiplied-alpha representation.
        // Transparent pixels in the packed video still contain bright RGB;
        // multiplying before canvas compositing prevents an outline on dark UI.
        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
        if (!gl) return;
        const shaders: WebGLShader[] = [];
        const shader = (type: number, source: string) => {
            const result = gl.createShader(type)!;
            gl.shaderSource(result, source);
            gl.compileShader(result);
            shaders.push(result);
            if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Portrait shader compilation failed');
            return result;
        };
        const program = gl.createProgram()!;
        let texture: WebGLTexture | null = null;
        let buffer: WebGLBuffer | null = null;
        let stopped = false;
        let frame = 0;
        let visible = true;
        let completed = false;
        let lastTime = -1;
        let lastDecodedFrame = -1;
        const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;
        let firstFrame = true;
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        const fail = () => { stopped = true; video.pause(); setReady(false); };
        try {
            gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 position; varying vec2 uv; void main(){ uv=vec2((position.x+1.0)*0.5,(1.0-position.y)*0.5); gl_Position=vec4(position,0.0,1.0); }'));
            gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
                precision mediump float;
                varying vec2 uv;
                uniform sampler2D footage;
                uniform vec2 matteTexel;
                void main() {
                    vec3 rgb = texture2D(footage, vec2(uv.x * 0.5, uv.y)).rgb;
                    vec2 maskUV = vec2(0.5 + uv.x * 0.5, uv.y);
                    float alpha = texture2D(footage, maskUV).r;
                    // Contract the matte by roughly one source pixel to discard
                    // the pale background spill along hair and jacket edges.
                    vec2 inset = matteTexel * 1.25;
                    alpha = min(alpha, texture2D(footage, maskUV + vec2(inset.x, 0.0)).r);
                    alpha = min(alpha, texture2D(footage, maskUV - vec2(inset.x, 0.0)).r);
                    alpha = min(alpha, texture2D(footage, maskUV + vec2(0.0, inset.y)).r);
                    alpha = min(alpha, texture2D(footage, maskUV - vec2(0.0, inset.y)).r);
                    // Suppress faint compression residue without a hard cutout.
                    alpha = smoothstep(0.04, 0.96, alpha);
                    gl_FragColor = vec4(rgb * alpha, alpha);
                }
            `));
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Portrait shader linking failed');
            gl.useProgram(program);
            buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
            const position = gl.getAttribLocation(program, 'position');
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        } catch {
            shaders.forEach(item => gl.deleteShader(item));
            gl.deleteProgram(program);
            gl.deleteBuffer(buffer);
            gl.deleteTexture(texture);
            return;
        }
        const matteTexel = gl.getUniformLocation(program, 'matteTexel');
        const draw = () => {
            if (stopped) return;
            const decodedFrame = Math.floor(video.currentTime * 24);
            if (video.readyState >= 2 && video.currentTime !== lastTime && (hasVideoFrameCallback || decodedFrame !== lastDecodedFrame)) {
                try {
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    gl.uniform2f(matteTexel, 1 / video.videoWidth, 1 / video.videoHeight);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                    lastTime = video.currentTime;
                    lastDecodedFrame = decodedFrame;
                    if (firstFrame) { setReady(true); firstFrame = false; }
                } catch { fail(); }
            }
        };
        const tick = () => {
            draw();
            if (!video.paused && !stopped) {
                frame = 'requestVideoFrameCallback' in video
                    ? video.requestVideoFrameCallback(tick)
                    : requestAnimationFrame(tick);
            }
        };
        const cancelFrame = () => {
            if ('cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(frame);
            else cancelAnimationFrame(frame);
        };
        const onPlay = () => { cancelFrame(); tick(); };
        const onPause = () => { cancelFrame(); draw(); };
        const updatePlayback = () => {
            if (visible && !document.hidden && !completed && !motion.matches && !stopped) {
                void video.play().catch(() => { /* Keep the transparent frame if autoplay is blocked. */ });
            } else video.pause();
        };
        const onEnded = () => { completed = true; draw(); cancelFrame(); };
        // Observe existing Home links without changing the navigation component.
        // Capture runs before its smooth-scroll handler, including keyboard clicks.
        const onHome = (event: MouseEvent) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
            if (!(link instanceof HTMLAnchorElement) || link.target === '_blank') return;
            const target = new URL(link.href, location.href);
            if (target.origin !== location.origin || target.pathname !== location.pathname || target.hash !== '#home') return;
            if (stopped) return;
            completed = false;
            video.currentTime = 0;
            lastTime = -1;
            lastDecodedFrame = -1;
            // Start on the user gesture; the visibility observer resumes it on arrival.
            if (!motion.matches && !document.hidden) void video.play().catch(() => {});
        };
        document.addEventListener('click', onHome, true);
        video.addEventListener('ended', onEnded);
        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updatePlayback(); }, { threshold: 0.05 });
        observer.observe(container);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('loadeddata', draw);
        video.addEventListener('seeked', draw);
        video.addEventListener('error', fail);
        canvas.addEventListener('webglcontextlost', fail);
        document.addEventListener('visibilitychange', updatePlayback);
        motion.addEventListener('change', updatePlayback);
        video.src = '/videos/hero-packed.mp4';
        video.load();
        updatePlayback();
        return () => {
            stopped = true;
            observer.disconnect();
            document.removeEventListener('click', onHome, true);
            video.removeEventListener('ended', onEnded);
            cancelFrame();
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('loadeddata', draw);
            video.removeEventListener('seeked', draw);
            video.removeEventListener('error', fail);
            canvas.removeEventListener('webglcontextlost', fail);
            document.removeEventListener('visibilitychange', updatePlayback);
            motion.removeEventListener('change', updatePlayback);
            video.pause();
            video.removeAttribute('src');
            video.load();
            shaders.forEach(item => gl.deleteShader(item));
            gl.deleteTexture(texture);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        };
    }, []);

    return <div className="hero-portrait" ref={containerRef}>
        <img className="hero-portrait-poster" src="/videos/hero-cutout.png" alt={name} width="720" height="1280" fetchPriority="high" />
        <canvas ref={canvasRef} className={`hero-portrait-canvas${ready ? ' is-ready' : ''}`} width="720" height="1280" role="img" aria-hidden={!ready} aria-label={`Moving portrait of ${name}`} />
        <video ref={videoRef} className="hero-video-source" muted playsInline preload="auto" aria-hidden="true" />
    </div>;
}
