import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
    SpeakerWaveIcon, 
    SpeakerXMarkIcon, 
    ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface SlingshotLampOverlayProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export const SlingshotLampOverlay: React.FC<SlingshotLampOverlayProps> = ({ containerRef }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const switchRef = useRef<HTMLDivElement | null>(null);

    // Audio & Game state
    const [muted, setMuted] = useState(false);
    const [bulbBroken, setBulbBroken] = useState(false);
    const [lightOn, setLightOn] = useState(true);
    const [stats, setStats] = useState({ shots: 0, bulbs: 0 });
    const [hasInteracted, setHasInteracted] = useState(false);
    const wakeUpRef = useRef<(() => void) | null>(null);

    // Dynamic coordinates for interactive DOM handles
    const [handles, setHandles] = useState({
        slingX: 100,
        slingY: 530,
        slingRestY: 455,
        lampX: 300,
        lampShadeY: 63,
        isMobile: false,
    });

    // References to keep mutable simulation state inside requestAnimationFrame
    const simRef = useRef({
        W: 0,
        H: 0,
        DPR: 1,
        lamp: { ax: 0, ay: 0, len: 28, theta: 0, omega: 0 },
        light: { on: true, I: 1, fil: 1, heat: 0, warm: 0, popT: 0, broken: false, flash: 0 },
        sling: {
            x: 100,
            y: 530,
            rest: { x: 100, y: 455 },
            pouch: { x: 100, y: 455 },
            vel: { x: 0, y: 0 },
            loaded: true,
            reloadT: 0,
            creakAt: 0,
            creakCd: 0,
        },
        mouse: { x: -999, y: -999 },
        grab: null as { type: 'pouch' | 'lamp'; offset?: number; pointerId?: number } | null,
        pebbles: [] as Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            a: number;
            hitT: number;
            rest: number;
            life: number;
        }>,
        shards: [] as Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            a: number;
            va: number;
            poly: number[][];
        }>,
        sparks: [] as Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            life: number;
            max: number;
        }>,
        muted: false,
    });

    useEffect(() => {
        simRef.current.muted = muted;
    }, [muted]);

    /* =========================================================================
       SYNTHESIZED WEB AUDIO (Zero network requests, zero latency)
       ========================================================================= */
    const audioContextRef = useRef<AudioContext | null>(null);
    const noiseBufferRef = useRef<AudioBuffer | null>(null);

    const getAudio = useCallback(() => {
        if (audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            return audioContextRef.current;
        }
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const ac = new AudioCtx();
            const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
            const d = noise.getChannelData(0);
            for (let i = 0; i < d.length; i++) {
                d[i] = Math.random() * 2 - 1;
            }
            audioContextRef.current = ac;
            noiseBufferRef.current = noise;
            return ac;
        } catch {
            return null;
        }
    }, []);

    const playSound = useCallback((name: string, amt = 1) => {
        if (simRef.current.muted) return;
        const ac = getAudio();
        if (!ac || ac.state !== 'running') return;
        const noise = noiseBufferRef.current;
        const t = ac.currentTime + 0.005;

        const burst = (dur: number, type: BiquadFilterType, freq: number, gain: number, q = 1) => {
            if (!noise) return;
            const s = ac.createBufferSource();
            s.buffer = noise;
            const f = ac.createBiquadFilter();
            f.type = type;
            f.frequency.value = freq;
            f.Q.value = q;
            const g = ac.createGain();
            g.gain.setValueAtTime(gain, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            s.connect(f).connect(g).connect(ac.destination);
            s.start(t, Math.random() * 0.5);
            s.stop(t + dur + 0.02);
        };

        const tone = (f0: number, f1: number, dur: number, gain: number, type: OscillatorType = 'sine') => {
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = type;
            o.frequency.setValueAtTime(f0, t);
            o.frequency.exponentialRampToValueAtTime(f1, t + dur);
            g.gain.setValueAtTime(gain, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g).connect(ac.destination);
            o.start(t);
            o.stop(t + dur + 0.02);
        };

        if (name === 'squeak') {
            const g = Math.max(0, Math.min(1, amt));
            const dur = 0.12 + g * 0.15;
            const base = 1350 + Math.random() * 300;
            const o = ac.createOscillator();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(base * 0.8, t);
            o.frequency.linearRampToValueAtTime(base * 1.15, t + dur * 0.4);
            o.frequency.linearRampToValueAtTime(base * 0.9, t + dur);
            const lfo = ac.createOscillator();
            const depth = ac.createGain();
            lfo.frequency.value = 24 + Math.random() * 10;
            depth.gain.value = base * 0.06;
            lfo.connect(depth).connect(o.frequency);
            const f = ac.createBiquadFilter();
            f.type = 'bandpass';
            f.frequency.value = base * 1.2;
            f.Q.value = 4;
            const v = ac.createGain();
            v.gain.setValueAtTime(0.0001, t);
            v.gain.exponentialRampToValueAtTime(0.03 + 0.07 * g, t + 0.03);
            v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(f).connect(v).connect(ac.destination);
            o.start(t);
            lfo.start(t);
            o.stop(t + dur + 0.02);
            lfo.stop(t + dur + 0.02);
        } else if (name === 'stretch') {
            const f0 = 90 + amt * 250;
            const o = ac.createOscillator();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(f0, t);
            o.frequency.linearRampToValueAtTime(f0 * 1.12, t + 0.05);
            const f = ac.createBiquadFilter();
            f.type = 'bandpass';
            f.frequency.value = f0 * 4;
            f.Q.value = 3;
            const v = ac.createGain();
            v.gain.setValueAtTime(0.04 + amt * 0.05, t);
            v.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
            o.connect(f).connect(v).connect(ac.destination);
            o.start(t);
            o.stop(t + 0.07);
            burst(0.02, 'bandpass', 1200 + amt * 1600, 0.04, 2);
        } else if (name === 'on' || name === 'off') {
            burst(0.012, 'highpass', 2600, 0.45);
            burst(0.014, 'bandpass', name === 'on' ? 1900 : 1300, 0.35, 2);
            tone(150, 60, 0.06, 0.2);
        } else if (name === 'twang') {
            burst(0.03, 'bandpass', 950, 0.35, 3);
            tone(200, 110, 0.16, 0.18, 'triangle');
        } else if (name === 'clank') {
            const g = Math.max(0.15, Math.min(1, amt));
            [1320, 2210, 3470].forEach((f, i) => tone(f, f * 0.98, 0.35 - i * 0.08, 0.08 * g, 'triangle'));
            burst(0.02, 'highpass', 3000, 0.35 * g);
        } else if (name === 'tap') {
            burst(0.03, 'lowpass', 500, Math.max(0.05, Math.min(0.4, amt)));
        } else if (name === 'pop') {
            burst(0.14, 'lowpass', 900, 0.9);
            tone(220, 40, 0.12, 0.3);
            for (let i = 0; i < 16; i++) {
                setTimeout(() => {
                    burst(0.02 + Math.random() * 0.06, 'bandpass', 3000 + Math.random() * 5000, 0.1 + Math.random() * 0.15, 9);
                }, i * 30 + Math.random() * 20);
            }
        }
    }, [getAudio]);

    // Switch Toggle
    const handleToggleSwitch = useCallback(() => {
        getAudio();
        wakeUpRef.current?.();
        const sim = simRef.current;
        const newOn = !sim.light.on;
        sim.light.on = newOn;
        setLightOn(newOn);
        playSound(newOn ? 'on' : 'off');

        if (switchRef.current) {
            switchRef.current.setAttribute('aria-checked', String(newOn));
        }

        if (!newOn) {
            sim.light.heat += 0.3;
        } else {
            sim.light.heat += 0.8;
            sim.light.warm = 0.15;
            if (sim.light.heat > 4.2) sim.light.popT = 0.12;
        }
    }, [getAudio, playSound]);

    // Bulb Replacement
    const handleReplaceBulb = useCallback(() => {
        getAudio();
        wakeUpRef.current?.();
        const sim = simRef.current;
        sim.light.broken = false;
        sim.light.heat = 0;
        sim.light.popT = 0;
        if (sim.light.on) {
            sim.light.warm = 0.2;
            playSound('on');
        }
        setBulbBroken(false);
    }, [getAudio, playSound]);

    // Keyboard support for R
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r' && simRef.current.light.broken) {
                handleReplaceBulb();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleReplaceBulb]);

    /* =========================================================================
       MAIN CANVAS SIMULATION & RENDERING LOOP
       ========================================================================= */
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const TAU = Math.PI * 2;
        const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const mix = (c1: number[], c2: number[], t: number) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
        const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

        const G = 2400;
        const PEBBLE_G = 1450;
        const STEP = 1 / 60;
        const BULB = [0, 56];
        const BULB_R = 13.5;
        const PEBBLE_R = 6.5;
        const LAUNCH = 14.5;

        const sim = simRef.current;

        // Resize & responsive anchor points
        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

            sim.W = w;
            sim.H = h;
            sim.DPR = dpr;

            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);

            const isMobile = w < 768;

            // Lamp: Anchored at top center, placed higher up above the section content
            sim.lamp.ax = w / 2;
            sim.lamp.ay = 0;
            sim.lamp.len = isMobile ? 22 : clamp(Math.min(w * 0.035, 32), 24, 30);

            // Catapult / Slingshot: Positioned lower down alongside the skills grid
            if (!isMobile) {
                // Desktop: in the left gutter, lower down (y ≈ 530, rest at y ≈ 455)
                sim.sling.x = clamp(w * 0.10, 65, 140);
                sim.sling.y = 530;
                sim.sling.rest = { x: sim.sling.x, y: 455 };
            } else {
                // Mobile: positioned lower down below the header
                sim.sling.x = clamp(w * 0.22, 70, 95);
                sim.sling.y = 420;
                sim.sling.rest = { x: sim.sling.x, y: 350 };
            }

            if (!sim.grab || sim.grab.type !== 'pouch') {
                sim.sling.pouch = { ...sim.sling.rest };
            }

            // Sync React state for interactive overlays
            setHandles({
                slingX: sim.sling.x,
                slingY: sim.sling.y,
                slingRestY: sim.sling.rest.y,
                lampX: sim.lamp.ax,
                lampShadeY: sim.lamp.len + 35,
                isMobile,
            });
        };

        updateSize();

        // Pendulum transforms
        const lampOrigin = () => ({
            x: sim.lamp.ax + Math.sin(sim.lamp.theta) * sim.lamp.len,
            y: sim.lamp.ay + Math.cos(sim.lamp.theta) * sim.lamp.len,
        });

        const toWorld = (lx: number, ly: number) => {
            const o = lampOrigin();
            const c = Math.cos(sim.lamp.theta);
            const s = Math.sin(sim.lamp.theta);
            return { x: o.x + lx * c + ly * s, y: o.y - lx * s + ly * c };
        };

        const toLocal = (x: number, y: number) => {
            const o = lampOrigin();
            const c = Math.cos(sim.lamp.theta);
            const s = Math.sin(sim.lamp.theta);
            const dx = x - o.x;
            const dy = y - o.y;
            return { x: dx * c - dy * s, y: dx * s + dy * c };
        };

        const dirToWorld = (nx: number, ny: number) => {
            const c = Math.cos(sim.lamp.theta);
            const s = Math.sin(sim.lamp.theta);
            return { x: nx * c + ny * s, y: -nx * s + ny * c };
        };

        const kickLamp = (px: number, py: number, fx: number, fy: number) => {
            const rx = px - sim.lamp.ax;
            const ry = py - sim.lamp.ay;
            sim.lamp.omega += (ry * fx - rx * fy) / (sim.lamp.len * sim.lamp.len);
        };

        const popBulb = (vx = 0, vy = 0) => {
            const b = toWorld(BULB[0], BULB[1]);
            sim.light.broken = true;
            sim.light.popT = 0;
            sim.light.flash = 1;
            setBulbBroken(true);
            setStats((prev) => ({ ...prev, bulbs: prev.bulbs + 1 }));

            for (let i = 0; i < 34; i++) {
                const ang = Math.random() * TAU;
                const sp = 110 + Math.random() * 420;
                const n = 3 + Math.floor(Math.random() * 2);
                const r = 2 + Math.random() * 5;
                const poly: number[][] = [];
                for (let k = 0; k < n; k++) {
                    const a = (k / n) * TAU + Math.random() * 0.8;
                    poly.push([Math.cos(a) * r * (0.5 + Math.random()), Math.sin(a) * r * (0.5 + Math.random())]);
                }
                sim.shards.push({
                    x: b.x + Math.cos(ang) * 7,
                    y: b.y + Math.sin(ang) * 7,
                    vx: Math.cos(ang) * sp + vx * 0.32,
                    vy: Math.sin(ang) * sp * 0.7 + 60 + vy * 0.32,
                    a: Math.random() * TAU,
                    va: (Math.random() - 0.5) * 24,
                    poly,
                });
            }

            for (let i = 0; i < 35; i++) {
                const ang = Math.random() * TAU;
                const sp = 180 + Math.random() * 600;
                sim.sparks.push({
                    x: b.x,
                    y: b.y,
                    vx: Math.cos(ang) * sp,
                    vy: Math.sin(ang) * sp,
                    life: 0.3 + Math.random() * 0.55,
                    max: 0.85,
                });
            }

            playSound('pop');
        };

        const knockSwitch = (nx: number, ny: number) => {
            if (!switchRef.current) return;
            switchRef.current.style.setProperty('--kx', `${-nx * 7}px`);
            switchRef.current.style.setProperty('--ky', `${-ny * 7}px`);
            switchRef.current.style.setProperty('--kr', `${(Math.random() - 0.5) * 7}deg`);
            switchRef.current.classList.remove('knock');
            void switchRef.current.offsetWidth;
            switchRef.current.classList.add('knock');
        };

        const collideSwitch = (p: typeof sim.pebbles[0]) => {
            if (p.hitT > 0 || !switchRef.current) return;
            const containerRect = container.getBoundingClientRect();
            const sr = switchRef.current.getBoundingClientRect();
            const switchRect = {
                left: sr.left - containerRect.left,
                right: sr.right - containerRect.left,
                top: sr.top - containerRect.top,
                bottom: sr.bottom - containerRect.top,
            };

            const r = PEBBLE_R;
            const cx = clamp(p.x, switchRect.left, switchRect.right);
            const cy = clamp(p.y, switchRect.top, switchRect.bottom);
            let nx = p.x - cx;
            let ny = p.y - cy;
            const d = Math.hypot(nx, ny);
            if (d > r) return;

            if (d === 0) {
                const sp = Math.hypot(p.vx, p.vy) || 1;
                nx = -p.vx / sp;
                ny = -p.vy / sp;
            } else {
                nx /= d;
                ny /= d;
            }

            const vn = p.vx * nx + p.vy * ny;
            if (vn >= 0) return;

            p.vx -= 1.4 * vn * nx;
            p.vy -= 1.4 * vn * ny;
            p.x = cx + nx * (r + 1);
            p.y = cy + ny * (r + 1);
            p.hitT = 0.1;
            playSound('tap', -vn / 2000);
            knockSwitch(nx, ny);
            handleToggleSwitch();
        };

        const collidePebble = (p: typeof sim.pebbles[0]) => {
            collideSwitch(p);
            if (p.hitT > 0) return;
            const l = toLocal(p.x, p.y);
            const r = PEBBLE_R;

            // Bulb collision (generous detection for satisfying gameplay)
            if (!sim.light.broken && Math.hypot(l.x - BULB[0], l.y - BULB[1]) < BULB_R + r + 5) {
                popBulb(p.vx, p.vy);
                kickLamp(p.x, p.y, p.vx * 0.08, p.vy * 0.08);
                p.vx *= 0.72;
                p.vy *= 0.72;
                p.hitT = 0.08;
                return;
            }

            // Shade collision
            if (l.y < 8 - r || l.y > 52 + r) return;
            const halfW = 10 + 40 * Math.pow(clamp((l.y - 10) / 42, 0, 1), 0.7);
            if (Math.abs(l.x) > halfW + r) return;

            let nx = l.x;
            let ny = l.y - 25;
            const nl = Math.hypot(nx, ny) || 1;
            nx /= nl;
            ny /= nl;
            const n = dirToWorld(nx, ny);
            const vn = p.vx * n.x + p.vy * n.y;
            if (vn >= 0) return;

            const e = 0.45;
            p.vx -= (1 + e) * vn * n.x;
            p.vy -= (1 + e) * vn * n.y;
            p.x += n.x * 5;
            p.y += n.y * 5;
            const J = -(1 + e) * vn * 0.22;
            kickLamp(p.x, p.y, -n.x * J, -n.y * J);
            p.hitT = 0.06;
            playSound('clank', -vn / 1200);
        };

        const step = (dt: number) => {
            let acc = -(G / sim.lamp.len) * Math.sin(sim.lamp.theta) - sim.lamp.omega * 0.32;
            if (sim.grab && sim.grab.type === 'lamp') {
                const tgt = clamp(Math.atan2(sim.mouse.x - sim.lamp.ax, sim.mouse.y - sim.lamp.ay) - (sim.grab.offset || 0), -1.15, 1.15);
                acc += (tgt - sim.lamp.theta) * 160 - sim.lamp.omega * 16;
            }
            sim.lamp.omega += acc * dt;
            const prevTheta = sim.lamp.theta;
            sim.lamp.theta = clamp(sim.lamp.theta + sim.lamp.omega * dt, -1.35, 1.35);
            if (Math.sign(prevTheta) !== Math.sign(sim.lamp.theta) && Math.abs(sim.lamp.omega) > 0.35) {
                playSound('squeak', (Math.abs(sim.lamp.omega) - 0.35) / 2);
            }

            // Slingshot pouch
            const maxPullDistance = sim.W < 768 ? 85 : 110;
            if (sim.grab && sim.grab.type === 'pouch') {
                let dx = sim.mouse.x - sim.sling.rest.x;
                let dy = sim.mouse.y - sim.sling.rest.y;
                const d = Math.hypot(dx, dy);
                if (d > maxPullDistance) {
                    dx *= maxPullDistance / d;
                    dy *= maxPullDistance / d;
                }
                sim.sling.pouch = { x: sim.sling.rest.x + dx, y: sim.sling.rest.y + dy };
                sim.sling.vel = { x: 0, y: 0 };
                const pull = Math.hypot(dx, dy);
                sim.sling.creakCd -= dt;
                if (Math.abs(pull - sim.sling.creakAt) > 6 && sim.sling.creakCd <= 0) {
                    playSound('stretch', pull / maxPullDistance);
                    sim.sling.creakAt = pull;
                    sim.sling.creakCd = 0.035;
                }
            } else {
                sim.sling.vel.x += ((sim.sling.rest.x - sim.sling.pouch.x) * 900 - sim.sling.vel.x * 12) * dt;
                sim.sling.vel.y += ((sim.sling.rest.y - sim.sling.pouch.y) * 900 - sim.sling.vel.y * 12) * dt;
                sim.sling.pouch.x += sim.sling.vel.x * dt;
                sim.sling.pouch.y += sim.sling.vel.y * dt;

                if (
                    Math.hypot(sim.sling.rest.x - sim.sling.pouch.x, sim.sling.rest.y - sim.sling.pouch.y) < 0.35 &&
                    Math.hypot(sim.sling.vel.x, sim.sling.vel.y) < 0.35
                ) {
                    sim.sling.pouch.x = sim.sling.rest.x;
                    sim.sling.pouch.y = sim.sling.rest.y;
                    sim.sling.vel.x = 0;
                    sim.sling.vel.y = 0;
                }
            }

            // Damped rest snapping for lamp pendulum
            if (!sim.grab || sim.grab.type !== 'lamp') {
                if (Math.abs(sim.lamp.omega) < 0.0004 && Math.abs(sim.lamp.theta) < 0.0006) {
                    sim.lamp.omega = 0;
                    sim.lamp.theta = 0;
                }
            }

            // Pebbles
            for (const p of sim.pebbles) {
                p.hitT = Math.max(0, p.hitT - dt);
                if (p.rest > 0) continue;
                p.vy += PEBBLE_G * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.a += p.vx * dt * 0.05;
                collidePebble(p);

                // Floor bounce
                if (p.y > sim.H - PEBBLE_R) {
                    p.y = sim.H - PEBBLE_R;
                    if (p.vy > 120) playSound('tap', p.vy / 3000);
                    p.vy *= -0.34;
                    p.vx *= 0.74;
                    if (Math.abs(p.vy) < 40 && Math.abs(p.vx) < 20) p.rest = 0.0001;
                }
                // Wall bounce
                if (p.x < PEBBLE_R || p.x > sim.W - PEBBLE_R) {
                    p.x = clamp(p.x, PEBBLE_R, sim.W - PEBBLE_R);
                    p.vx *= -0.5;
                }
            }
        };

        const updateWorld = (dt: number) => {
            if (!sim.sling.loaded) {
                sim.sling.reloadT -= dt;
                if (sim.sling.reloadT <= 0) sim.sling.loaded = true;
            }
            for (const p of sim.pebbles) {
                if (p.rest > 0) {
                    p.rest += dt;
                    if (p.rest > 3) p.life -= dt * 1.5;
                }
            }
            sim.pebbles = sim.pebbles.filter((p) => p.life > 0 && p.y < sim.H + 200).slice(-10);

            // Shards
            for (const s of sim.shards) {
                s.vy += G * 0.72 * dt;
                s.x += s.vx * dt;
                s.y += s.vy * dt;
                s.a += s.va * dt;
                if (s.y > sim.H - 3) {
                    s.y = sim.H - 3;
                    s.vy *= -0.26;
                    s.vx *= 0.6;
                    s.va *= 0.5;
                    if (Math.abs(s.vy) < 30) s.vy = 0;
                }
                if (s.x < 0 || s.x > sim.W) {
                    s.vx *= -0.5;
                    s.x = clamp(s.x, 0, sim.W);
                }
            }
            sim.shards = sim.shards.slice(-180);

            // Sparks
            for (const p of sim.sparks) {
                p.vy += G * 0.4 * dt;
                p.vx *= 0.985;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt;
            }
            sim.sparks = sim.sparks.filter((p) => p.life > 0);
        };

        const updateLight = (dt: number) => {
            sim.light.heat = Math.max(0, sim.light.heat - dt * 0.35);
            let target = sim.light.on && !sim.light.broken ? 1 : 0;
            if (sim.light.warm > 0) {
                sim.light.warm -= dt;
                target *= Math.random() < 0.45 ? 0.15 : 1;
            }
            if (sim.light.on && sim.light.heat > 2.5 && Math.random() < (sim.light.heat - 2.5) * 0.06) {
                target *= 0.3;
            }
            if (sim.light.popT > 0) {
                sim.light.popT -= dt;
                target = 1.6;
                if (sim.light.popT <= 0) {
                    popBulb();
                    target = 0;
                }
            }
            const upI = target > sim.light.I ? 32 : 16;
            sim.light.I = lerp(sim.light.I, target, 1 - Math.exp(-upI * dt));
            const upF = target > sim.light.fil ? 14 : 3.2;
            sim.light.fil = lerp(sim.light.fil, clamp(target, 0, 1), 1 - Math.exp(-upF * dt));
            if (sim.light.broken) sim.light.fil = 0;
            sim.light.flash = Math.max(0, sim.light.flash - dt * 3.5);

            // Settled snap when light reaches equilibrium
            if (sim.light.warm <= 0 && sim.light.popT <= 0) {
                if (Math.abs(sim.light.I - target) < 0.002) sim.light.I = target;
                if (Math.abs(sim.light.fil - clamp(target, 0, 1)) < 0.002) sim.light.fil = clamp(target, 0, 1);
            }
        };

        /* =========================================================================
           DRAWING FUNCTIONS
           ========================================================================= */
        const renderLight = () => {
            const I = clamp(sim.light.I, 0, 1);
            if (I <= 0.01) return;

            const b = toWorld(BULB[0], BULB[1]);
            const apex = toWorld(0, 2);
            const rl = toWorld(-50, 50);
            const rr = toWorld(50, 50);
            const far = Math.min(sim.W, sim.H) * 1.5;
            const nl = Math.hypot(rl.x - apex.x, rl.y - apex.y) || 1;
            const nr = Math.hypot(rr.x - apex.x, rr.y - apex.y) || 1;
            const dl = { x: (rl.x - apex.x) / nl, y: (rl.y - apex.y) / nl };
            const dr = { x: (rr.x - apex.x) / nr, y: (rr.y - apex.y) / nr };

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';

            // Light cone
            const coneGrad = ctx.createRadialGradient(b.x, b.y, 10, b.x, b.y, far);
            coneGrad.addColorStop(0, `rgba(255, 214, 160, ${I * 0.16})`);
            coneGrad.addColorStop(0.4, `rgba(255, 200, 135, ${I * 0.07})`);
            coneGrad.addColorStop(1, 'rgba(255, 190, 120, 0)');
            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.moveTo(rl.x, rl.y);
            ctx.lineTo(rr.x, rr.y);
            ctx.lineTo(rr.x + dr.x * far, rr.y + dr.y * far);
            ctx.lineTo(rl.x + dl.x * far, rl.y + dl.y * far);
            ctx.closePath();
            ctx.fill();

            // Warm halo around bulb
            const halo = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 130);
            halo.addColorStop(0, `rgba(255, 210, 150, ${I * 0.28})`);
            halo.addColorStop(1, 'rgba(255, 210, 150, 0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(b.x, b.y, 130, 0, TAU);
            ctx.fill();

            ctx.restore();
        };

        const drawBulb = (I: number) => {
            if (sim.light.broken) {
                ctx.fillStyle = 'rgba(200,215,230,0.08)';
                ctx.strokeStyle = 'rgba(220,230,240,0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                const jag = [
                    [-8, 46], [-9, 52], [-6, 49], [-4, 55], [-2, 50], 
                    [0, 54], [2, 49], [4, 56], [6, 50], [9, 53], [8, 46]
                ];
                jag.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = 'rgba(120,105,85,0.8)';
                ctx.beginPath();
                ctx.moveTo(-3, 46); ctx.lineTo(-4, 54);
                ctx.moveTo(3, 46); ctx.lineTo(4, 54);
                ctx.stroke();
                return;
            }

            const [bx, by] = BULB;
            const heatTint = clamp((sim.light.heat - 2) / 2.5, 0, 1);
            const gg = ctx.createRadialGradient(bx, by + 1, 0, bx, by, 15);
            gg.addColorStop(0, rgba(mix([255, 244, 222], [255, 255, 245], heatTint), 0.06 + 0.92 * I));
            gg.addColorStop(0.55, rgba([255, 205, 140], 0.04 + 0.62 * I));
            gg.addColorStop(1, rgba([255, 168, 90], 0.07 + 0.3 * I));
            ctx.fillStyle = gg;
            ctx.beginPath();
            ctx.arc(bx, by, BULB_R, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255,${0.16 + 0.25 * I})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.strokeStyle = 'rgba(170,158,140,0.55)';
            ctx.beginPath();
            ctx.moveTo(-3, 46); ctx.lineTo(-4, 58);
            ctx.moveTo(3, 46); ctx.lineTo(4, 58);
            ctx.stroke();

            const f = sim.light.fil;
            ctx.save();
            ctx.strokeStyle = rgba(mix([96, 78, 56], [255, 244, 214], f), 1);
            ctx.lineWidth = 1.2;
            if (f > 0.03) {
                ctx.shadowColor = `rgba(255,170,80,${f})`;
                ctx.shadowBlur = 12 * f;
            }
            ctx.beginPath();
            ctx.moveTo(-4, 58);
            for (let k = 1; k <= 8; k++) {
                const x = -4 + (8 * k) / 8;
                const sag = Math.sin((k / 8) * Math.PI) * 2;
                ctx.lineTo(x, 58 + sag + (k % 2 ? -1.1 : 1.1));
            }
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            ctx.beginPath();
            ctx.ellipse(-5, 52, 1.8, 4, -0.5, 0, TAU);
            ctx.fill();
        };

        const drawLamp = () => {
            const o = lampOrigin();
            const I = clamp(sim.light.I, 0, 1);

            // Cord hanging from ceiling
            ctx.strokeStyle = '#36393e';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(sim.lamp.ax, sim.lamp.ay);
            ctx.lineTo(o.x, o.y);
            ctx.stroke();

            ctx.save();
            ctx.translate(o.x, o.y);
            ctx.rotate(-sim.lamp.theta);

            // Socket cap
            const cg = ctx.createLinearGradient(-6, 0, 6, 0);
            cg.addColorStop(0, '#16181a');
            cg.addColorStop(0.45, '#4a4e54');
            cg.addColorStop(1, '#121315');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.roundRect(-6, -2, 12, 13, 2.5);
            ctx.fill();

            // Conical shade
            const sg = ctx.createLinearGradient(-48, 0, 48, 0);
            sg.addColorStop(0, '#0d0e10');
            sg.addColorStop(0.3, '#26292d');
            sg.addColorStop(0.42, '#4d5157');
            sg.addColorStop(0.58, '#23262a');
            sg.addColorStop(1, '#0b0c0d');
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.moveTo(-10, 10);
            ctx.bezierCurveTo(-20, 12, -42, 26, -48, 48);
            ctx.lineTo(48, 48);
            ctx.bezierCurveTo(42, 26, 20, 12, 10, 10);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Inner warm bounce rim
            const ug = ctx.createRadialGradient(0, 50, 0, 0, 48, 48);
            ug.addColorStop(0, rgba(mix([22, 23, 25], [255, 232, 196], I), 1));
            ug.addColorStop(1, rgba(mix([10, 11, 12], [196, 128, 64], I), 1));
            ctx.fillStyle = ug;
            ctx.beginPath();
            ctx.ellipse(0, 48, 48, 6, 0, 0, TAU);
            ctx.fill();

            drawBulb(I);

            ctx.strokeStyle = `rgba(255,255,255,${0.12 + I * 0.2})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(0, 48, 48, 6, 0, 0, Math.PI);
            ctx.stroke();
            ctx.restore();

            if (I > 0.01) {
                const b = toWorld(BULB[0], BULB[1]);
                const h = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 65);
                h.addColorStop(0, `rgba(255,200,130,${0.45 * I})`);
                h.addColorStop(1, 'rgba(255,200,130,0)');
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = h;
                ctx.fillRect(b.x - 65, b.y - 65, 130, 130);
                ctx.globalCompositeOperation = 'source-over';
            }
        };

        const drawPebble = (x: number, y: number, a: number, alpha = 1) => {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            ctx.rotate(a);
            const g = ctx.createRadialGradient(-2, -2, 0, 0, 0, PEBBLE_R + 1);
            g.addColorStop(0, '#aba69e');
            g.addColorStop(0.6, '#6b665f');
            g.addColorStop(1, '#33302c');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(0, 0, PEBBLE_R + 0.6, PEBBLE_R - 0.6, 0, 0, TAU);
            ctx.fill();
            ctx.restore();
        };

        const drawSlingshot = () => {
            const { x, y } = sim.sling;
            const isMobile = sim.W < 768;
            const forkH = isMobile ? 58 : 68;
            const forkSpread = isMobile ? 20 : 24;
            const tipL = { x: x - forkSpread, y: y - forkH };
            const tipR = { x: x + forkSpread, y: y - forkH };
            const p = sim.sling.pouch;
            const aiming = sim.grab && sim.grab.type === 'pouch';
            const maxPullDistance = isMobile ? 85 : 110;
            const stretch = clamp(Math.hypot(p.x - sim.sling.rest.x, p.y - sim.sling.rest.y) / maxPullDistance, 0, 1);
            const bandW = 3.6 - stretch * 1.8;

            // Pedestal base mount
            ctx.fillStyle = '#22150b';
            ctx.beginPath();
            ctx.ellipse(x, y + 6, forkSpread + 6, 6, 0, 0, TAU);
            ctx.fill();

            // Left rubber band
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#7c2f24';
            ctx.lineWidth = bandW;
            ctx.beginPath();
            ctx.moveTo(tipL.x, tipL.y);
            ctx.lineTo(p.x - 5, p.y);
            ctx.stroke();

            // Wooden Y fork
            const wood = ctx.createLinearGradient(x - 22, 0, x + 22, 0);
            wood.addColorStop(0, '#3b2515');
            wood.addColorStop(0.45, '#8c5a34');
            wood.addColorStop(1, '#382314');
            ctx.strokeStyle = wood;
            ctx.lineWidth = isMobile ? 8.5 : 10;
            ctx.beginPath();
            ctx.moveTo(x, y + 4);
            ctx.lineTo(x, y - (forkH * 0.52));
            ctx.quadraticCurveTo(x - 3, y - (forkH * 0.7), tipL.x, tipL.y);
            ctx.moveTo(x, y - (forkH * 0.52));
            ctx.quadraticCurveTo(x + 3, y - (forkH * 0.7), tipR.x, tipR.y);
            ctx.stroke();

            // Wood grain highlight
            ctx.strokeStyle = 'rgba(255,220,180,0.12)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(x - 2, y);
            ctx.lineTo(x - 2, y - (forkH * 0.5));
            ctx.stroke();

            // -----------------------------------------------------------------
            // PROMINENT "CATERPILLAR" TRAJECTORY PREDICTION DOTS
            // Real-time parabolic path directly toward the bulb
            // -----------------------------------------------------------------
            if (aiming) {
                const vx = (sim.sling.rest.x - p.x) * LAUNCH;
                const vy = (sim.sling.rest.y - p.y) * LAUNCH;
                const numDots = isMobile ? 20 : 26;

                for (let i = 1; i <= numDots; i++) {
                    const t = i * 0.026;
                    const px = p.x + vx * t;
                    const py = p.y + vy * t + 0.5 * PEBBLE_G * t * t;
                    if (px < 0 || px > sim.W || py > sim.H) break;

                    const r = Math.max(1.8, (isMobile ? 3.8 : 4.4) * (1 - i / (numDots + 4)));
                    const alpha = 0.92 * (1 - i / (numDots + 2));

                    ctx.save();
                    ctx.shadowColor = '#f3c98f';
                    ctx.shadowBlur = 8;
                    ctx.fillStyle = `rgba(243, 201, 143, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(px, py, r, 0, TAU);
                    ctx.fill();
                    ctx.restore();
                }
            }

            // Leather pouch
            ctx.fillStyle = '#492a1a';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, 9.5, 6, Math.atan2(p.y - sim.sling.rest.y, p.x - sim.sling.rest.x), 0, TAU);
            ctx.fill();

            if (sim.sling.loaded) {
                drawPebble(p.x, p.y, 0);
            }

            // Right rubber band
            ctx.strokeStyle = '#8d3527';
            ctx.lineWidth = bandW;
            ctx.beginPath();
            ctx.moveTo(tipR.x, tipR.y);
            ctx.lineTo(p.x + 5, p.y);
            ctx.stroke();
        };

        const drawParticles = () => {
            for (const p of sim.pebbles) {
                drawPebble(p.x, p.y, p.a, clamp(p.life, 0, 1));
            }

            for (const s of sim.shards) {
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.a);
                ctx.fillStyle = 'rgba(210,225,240,0.18)';
                ctx.strokeStyle = 'rgba(230,238,248,0.55)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                s.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            if (sim.sparks.length > 0) {
                ctx.globalCompositeOperation = 'lighter';
                ctx.lineCap = 'round';
                for (const p of sim.sparks) {
                    const t = clamp(p.life / p.max, 0, 1);
                    ctx.strokeStyle = `rgba(255,${Math.round(150 + 90 * t)},${Math.round(80 * t)},${t})`;
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.vx * 0.012, p.y - p.vy * 0.012);
                    ctx.stroke();
                }
                ctx.globalCompositeOperation = 'source-over';
            }
        };

        const render = () => {
            ctx.setTransform(sim.DPR, 0, 0, sim.DPR, 0, 0);
            ctx.clearRect(0, 0, sim.W, sim.H);
            renderLight();
            drawLamp();
            if (sim.W >= 768) {
                drawSlingshot();
            }
            drawParticles();

            if (sim.light.flash > 0) {
                ctx.fillStyle = `rgba(255,236,200,${sim.light.flash * 0.45})`;
                ctx.fillRect(0, 0, sim.W, sim.H);
            }
        };

        let isRunning = false;
        let isVisible = false;
        let animId = 0;
        let lastTime = performance.now();
        let accT = 0;

        const wakeUp = () => {
            if (isRunning || !isVisible) return;
            isRunning = true;
            lastTime = performance.now();
            accT = 0;
            animId = requestAnimationFrame(frame);
        };
        wakeUpRef.current = wakeUp;

        const frame = (now: number) => {
            if (!isVisible) {
                isRunning = false;
                return;
            }

            const dt = Math.min(0.05, (now - lastTime) / 1000);
            lastTime = now;
            accT += dt;

            while (accT >= STEP) {
                step(STEP);
                accT -= STEP;
            }

            updateWorld(dt);
            updateLight(dt);
            render();

            // Check if scene has converged to complete rest (zero moving parts)
            const targetLight = sim.light.on && !sim.light.broken ? 1 : 0;
            const isLampSettled = Math.abs(sim.lamp.omega) < 0.002 && Math.abs(sim.lamp.theta) < 0.002;
            if (isLampSettled && (!sim.grab || sim.grab.type !== 'lamp')) {
                sim.lamp.omega = 0;
                sim.lamp.theta = 0;
            }

            const isSlingSettled =
                Math.hypot(sim.sling.rest.x - sim.sling.pouch.x, sim.sling.rest.y - sim.sling.pouch.y) < 0.8 &&
                Math.hypot(sim.sling.vel.x, sim.sling.vel.y) < 0.8;
            if (isSlingSettled && (!sim.grab || sim.grab.type !== 'pouch')) {
                sim.sling.pouch.x = sim.sling.rest.x;
                sim.sling.pouch.y = sim.sling.rest.y;
                sim.sling.vel.x = 0;
                sim.sling.vel.y = 0;
            }

            if (Math.abs(sim.light.I - targetLight) < 0.008) sim.light.I = targetLight;
            if (Math.abs(sim.light.fil - targetLight) < 0.008) sim.light.fil = targetLight;

            const isIdle =
                !sim.grab &&
                sim.pebbles.length === 0 &&
                sim.shards.length === 0 &&
                sim.sparks.length === 0 &&
                sim.lamp.omega === 0 &&
                sim.lamp.theta === 0 &&
                sim.sling.loaded &&
                sim.sling.vel.x === 0 &&
                sim.sling.vel.y === 0 &&
                sim.sling.pouch.x === sim.sling.rest.x &&
                sim.sling.pouch.y === sim.sling.rest.y &&
                sim.light.I === targetLight &&
                sim.light.fil === targetLight &&
                sim.light.flash <= 0 &&
                sim.light.popT <= 0 &&
                sim.light.warm <= 0;

            if (isIdle) {
                isRunning = false;
                return; // Sleep animation loop until next interaction to free 100% CPU/GPU resources
            }

            animId = requestAnimationFrame(frame);
        };

        // ResizeObserver: Re-layout and render static frame without starting continuous RAF loop
        const resizeObserver = new ResizeObserver(() => {
            updateSize();
            render();
        });
        resizeObserver.observe(container);

        // IntersectionObserver: Only allow RAF loop when About section is actually scrolled in view
        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting;
                if (!isVisible) {
                    if (isRunning) {
                        cancelAnimationFrame(animId);
                        isRunning = false;
                    }
                }
            },
            { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
        );
        intersectionObserver.observe(container);

        // Theme MutationObserver: Redraw static frame immediately when user toggles dark/light theme
        const themeObserver = new MutationObserver(() => {
            render();
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            if (isRunning) {
                cancelAnimationFrame(animId);
            }
            wakeUpRef.current = null;
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            themeObserver.disconnect();
        };
    }, [handleToggleSwitch, playSound]);

    /* =========================================================================
       TOUCH & POINTER INTERACTIONS (Non-blocking for smooth mobile scrolling)
       ========================================================================= */
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        getAudio();
        wakeUpRef.current?.();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const sim = simRef.current;
        const grabRadius = sim.W < 768 ? 44 : 50;

        // Check if hitting slingshot pouch (only on desktop)
        if (sim.W >= 768 && sim.sling.loaded && Math.hypot(x - sim.sling.pouch.x, y - sim.sling.pouch.y) < grabRadius) {
            e.currentTarget.setPointerCapture(e.pointerId);
            sim.grab = { type: 'pouch', pointerId: e.pointerId };
            sim.mouse = { x, y };
            setHasInteracted(true);
            return;
        }

        // Check if hitting lamp shade
        const lampOrigin = {
            x: sim.lamp.ax + Math.sin(sim.lamp.theta) * sim.lamp.len,
            y: sim.lamp.ay + Math.cos(sim.lamp.theta) * sim.lamp.len,
        };
        const dx = x - lampOrigin.x;
        const dy = y - lampOrigin.y;
        const c = Math.cos(sim.lamp.theta);
        const s = Math.sin(sim.lamp.theta);
        const lx = dx * c - dy * s;
        const ly = dx * s + dy * c;
        const halfW = 12 + 45 * Math.max(0, Math.min(1, (ly - 8) / 44)) + 14;

        if (ly > -6 && ly < 78 && Math.abs(lx) < halfW) {
            e.currentTarget.setPointerCapture(e.pointerId);
            const tgt = Math.atan2(x - sim.lamp.ax, y - sim.lamp.ay);
            sim.grab = { type: 'lamp', offset: tgt - sim.lamp.theta, pointerId: e.pointerId };
            sim.mouse = { x, y };
            return;
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const sim = simRef.current;
        sim.mouse = { x, y };
        if (sim.grab) {
            wakeUpRef.current?.();
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        wakeUpRef.current?.();
        const sim = simRef.current;
        if (sim.grab && sim.grab.type === 'pouch') {
            const LAUNCH = 14.5;
            const vx = (sim.sling.rest.x - sim.sling.pouch.x) * LAUNCH;
            const vy = (sim.sling.rest.y - sim.sling.pouch.y) * LAUNCH;
            const pull = Math.hypot(vx, vy) / LAUNCH;
            if (pull >= 14) {
                sim.pebbles.push({
                    x: sim.sling.pouch.x,
                    y: sim.sling.pouch.y,
                    vx,
                    vy,
                    a: 0,
                    hitT: 0,
                    rest: 0,
                    life: 1,
                });
                sim.sling.loaded = false;
                sim.sling.reloadT = 0.45;
                sim.sling.vel = { x: vx * 0.4, y: vy * 0.4 };
                setStats((prev) => ({ ...prev, shots: prev.shots + 1 }));
                playSound('twang');
            }
            sim.sling.creakAt = 0;
        }
        if (sim.grab && e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        sim.grab = null;
    };

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-20">
            {/* The main canvas layer for lighting, swinging lamp, slingshot, and particles */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block pointer-events-none transform-gpu"
                style={{ willChange: 'contents' }}
            />

            {/* Interactive Pointer Surface on the Lamp Shade (Top Center) */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-36 h-28 sm:h-32 cursor-grab active:cursor-grabbing pointer-events-auto touch-none"
                style={{ zIndex: 25 }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                title="Drag to swing the lamp"
            />

            {/* Interactive Pointer Surface on the Slingshot (Only shown on desktop / md:block) */}
            <div
                className="hidden md:block absolute pointer-events-auto touch-none group/sling"
                style={{
                    left: `${handles.slingX - (handles.isMobile ? 38 : 48)}px`,
                    top: `${handles.slingRestY - (handles.isMobile ? 38 : 48)}px`,
                    width: handles.isMobile ? '76px' : '96px',
                    height: handles.isMobile ? '90px' : '115px',
                    zIndex: 25,
                    cursor: 'crosshair',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                title="Pull and aim the pebble"
            >
                {/* Subtle idle pulsing hint to make slingshot discovery effortless */}
                {!hasInteracted && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-mono border border-amber-500/35 shadow-sm animate-pulse">
                        Pull to shoot 🎯
                    </div>
                )}
            </div>

            {/* Top Right Controls: Sound Toggle & Stats */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-6 flex items-center gap-2 pointer-events-auto z-30">
                {/* Shots / Bulbs Counter pill */}
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-subtle text-[11px] font-mono text-gray-500 dark:text-gray-400 border border-black/[0.05] dark:border-white/[0.08]">
                    <span>shots: <b className="text-gray-800 dark:text-gray-200">{stats.shots}</b></span>
                    <span>·</span>
                    <span>broken: <b className="text-gray-800 dark:text-gray-200">{stats.bulbs}</b></span>
                </div>

                {/* Sound Toggle Button */}
                <button
                    onClick={() => {
                        getAudio();
                        setMuted(!muted);
                    }}
                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-full glass-card hover:bg-white dark:hover:bg-gray-800 border border-black/[0.05] dark:border-white/[0.1] text-xs font-mono text-gray-600 dark:text-gray-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    title={muted ? 'Unmute sound' : 'Mute sound'}
                    aria-label="Toggle sound"
                >
                    {muted ? (
                        <>
                            <SpeakerXMarkIcon className="w-4 h-4 text-red-400" />
                            <span className="hidden sm:inline">sound: off</span>
                        </>
                    ) : (
                        <>
                            <SpeakerWaveIcon className="w-4 h-4 text-primary-500" />
                            <span className="hidden sm:inline">sound: on</span>
                        </>
                    )}
                </button>
            </div>

            {/* 3D Wall Switch (Right Side of Header) */}
            <div
                ref={switchRef}
                onClick={handleToggleSwitch}
                onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleToggleSwitch();
                    }
                }}
                role="switch"
                aria-checked={lightOn}
                tabIndex={0}
                className="absolute right-2 sm:right-6 md:right-8 top-12 sm:top-20 pointer-events-auto switch-box z-30 scale-75 sm:scale-100 origin-top-right"
                title="Click or shoot with pebble to toggle light"
                aria-label="Toggle lamp switch"
            >
                <span className="screw top" />
                <span className="engraved on">ON</span>
                <div className="switch-slot">
                    <div className="switch-lever" />
                </div>
                <span className="pilot-led" />
                <span className="engraved off">OFF</span>
                <span className="screw bot" />
            </div>

            {/* Floating "Replace Bulb" Reset Button when shattered */}
            {bulbBroken && (
                <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 pointer-events-auto z-40 animate-bounce">
                    <button
                        onClick={handleReplaceBulb}
                        className="px-4 py-2 rounded-full bg-amber-400 text-gray-900 font-bold text-xs shadow-xl hover:bg-amber-300 transition-all flex items-center gap-2 border border-amber-200"
                        title="Restore broken bulb"
                    >
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Replace Bulb (R)
                    </button>
                </div>
            )}
        </div>
    );
};
