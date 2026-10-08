# Hero redesign and media handoff

## Scope

The hero was redesigned; the biography was subsequently moved into About Me at the user's request. `HeroSection.tsx` owns the layout, scoped
`HeroSection.css`, and GSAP entrance/scroll/pointer animation. `HeroPortrait.tsx`
owns playback and transparent compositing. Navbar, Skills, Projects,
Experience, Contact, data storage, theme configuration, and dependency manifests
were not changed. The original CV handler (including data-URL PDF/Word downloads
and external URLs) and `#contact`/`#about` destinations are retained.

The live `profile` data remains authoritative. Name and primary title remain in
Hero; the full biography and additional titles now appear at the top of the
About Me content column. The repository's seed data contains placeholders, so
real content still depends on the existing Firestore provider. No database writes
were made. Supporting hero content sits in a separate row below the enlarged
portrait stage; the desktop negative-margin overlap was removed.

## Media processing completed

- Input: `public/hero.webm`, VP9, 720 × 1280, 24 fps, 240 frames / 10 seconds.
- The existing MP4 and both original video directories remain untouched.
- Model: official Robust Video Matting MobileNetV3 FP32 TorchScript, CPU inference,
  downsample ratio 0.5, recurrent states carried across every frame. Eight
  opening-frame warmup passes stabilize the initial matte.
- RGB pixels inside the subject are retained from the original decoded footage.
  RVM foreground decontamination is limited to partially transparent edge pixels.
- No generated person, synthesized movements, frame interpolation, speed change,
  or frame trimming. The source's existing end-to-start pose change remains;
  making that seamless would require changing the footage/timing.
- The original `public/signature.png` is RGBA with transparent corners and about
  85% fully transparent pixels. It is used directly without alteration, including
  the existing textured pixels around the handwriting.

Outputs:

| File in `public/videos` | Purpose | Size |
| --- | --- | --- |
| `hero-alpha.webm` | VP9 with a genuine alpha plane; alternate export | 1,746,734 bytes |
| `hero-packed.mp4` | H.264 color left / grayscale alpha right, 1440 × 1280 | 2,872,422 bytes |
| `hero-cutout.png` | Transparent first-frame poster / unsupported playback fallback | 542,557 bytes |

The website intentionally uses the packed MP4 for every WebGL-capable browser.
Both halves share a single video decoder and timestamp, so the matte cannot
drift. A small shader combines them into a transparent 720 × 1280 canvas. There
is no inference in the browser, per-pixel JavaScript, dual-stream synchronization,
or assumption that all browsers decode WebM alpha. The alpha WebM is provided as
an alternate asset, not loaded redundantly.

Playback is muted, inline, and plays once automatically when motion is allowed.
It pauses offscreen and in hidden tabs, then holds the final frame when finished.
The existing Home links (including the logo) rewind and replay it; ordinary
visibility changes do not restart a completed clip. No play/pause control is
shown. Reduced motion disables GSAP motion and video playback. Missing WebGL,
decoder failure, or context loss retains the transparent PNG. If autoplay is
blocked, a subsequent Home activation retries through a user gesture.

## Reproduce offline processing

The processing script needs Python with `torch`, `opencv-python`, `numpy`, `Pillow`,
and `imageio-ffmpeg`. These were already available locally; no application
dependencies were added. The downloaded model and inspection frames are ignored
under `.hero-tools/`.

Official project: https://github.com/PeterL1n/RobustVideoMatting

From the repository root in PowerShell:

```powershell
New-Item -ItemType Directory -Force .hero-tools
Invoke-WebRequest -Uri 'https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.torchscript' -OutFile '.hero-tools/rvm_mobilenetv3_fp32.torchscript'
python scripts/prepare-hero.py
```

## Validation and limits

- Production build / TypeScript check: passed.
- Hero-specific ESLint: passed.
- Repository-wide ESLint: 14 existing errors and 2 warnings in untouched files.
- FFmpeg reports both output streams at 24 fps / 10 seconds; packed output has
  all 240 frames. WebM was decoded explicitly with libvpx-vp9 and its alpha plane
  verified to contain both 0 and 255, rather than relying on metadata alone.
- Decoded packed frames 0, 48, 96, 144, 192, and 239 were checked for clear
  background, opaque face, and visible subject edges. First-frame compressed
  mask mean absolute error is 0.061 on the 0–255 scale. Gray and checkerboard
  inspection images are in `.hero-tools/`. This is sampled visual QA, not a claim
  of perfect rotoscoping or a browser playback test.
- Browser preview access was declined. Chrome, Edge, Firefox, and Safari playback,
  interactive controls, and actual responsive screenshots remain unverified.
  H.264 + WebGL is the intended common playback path; PNG is the unsupported path.
- No reference video attachment was available in the conversation. The written
  design brief guided the composition.
- Display type uses Barlow Condensed via Google Fonts with Impact / Arial Narrow
  fallbacks. A ResizeObserver measures the actual rendered font to fit SITHUM to
  the stage width, including after font loading.

Before release, check 320/375/768/1024/1440/1920px widths and mobile landscape,
reduced motion, keyboard focus, CV data-URL and external downloads, play-once behavior
across scrolling/tab changes, and Home replay on each target browser. The
layout reserves the complete original frame, keeping the head inside the stage
throughout the source's forward movement.

Responsive follow-up: removed the upper identity/Portfolio label, widened the
stage to viewport width minus 1rem on each side, and sized the stage with svh
constraints for desktop, tablet, phones, and landscape. Playback handler checks
passed for completion, Home restart, other links, visibility, and reduced motion.
