"""Offline recurrent matting. Requires torch, opencv-python, Pillow, imageio-ffmpeg.
Download the official RVM MobileNet FP32 TorchScript into .hero-tools first.
Original footage and signature are never overwritten.
"""
from pathlib import Path
import subprocess
import cv2
import numpy as np
import torch
from PIL import Image
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'videos'
WORK = ROOT / '.hero-tools'
OUT.mkdir(exist_ok=True)
torch.set_num_threads(4)
model = torch.jit.load(str(WORK / 'rvm_mobilenetv3_fp32.torchscript'), map_location='cpu').eval()
cap = cv2.VideoCapture(str(ROOT / 'public' / 'hero.webm'))
w, h = int(cap.get(3)), int(cap.get(4))
fps, count = cap.get(5), int(cap.get(7))
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
base = [ffmpeg, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-r', str(fps)]
alpha = subprocess.Popen(base + ['-pix_fmt', 'rgba', '-s', f'{w}x{h}', '-i', '-', '-an', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '28', '-auto-alt-ref', '0', str(OUT / 'hero-alpha.webm')], stdin=subprocess.PIPE)
packed = subprocess.Popen(base + ['-pix_fmt', 'rgb24', '-s', f'{w*2}x{h}', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(OUT / 'hero-packed.mp4')], stdin=subprocess.PIPE)
rec = [None] * 4
# Warm the temporal state at the opening frame before encoding it.
ok, first = cap.read()
assert ok
first_tensor = torch.from_numpy(cv2.cvtColor(first, cv2.COLOR_BGR2RGB)).permute(2, 0, 1).unsqueeze(0).float() / 255
with torch.inference_mode():
    for _ in range(8):
        _, _, *rec = model(first_tensor, *rec, 0.5)
cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
with torch.inference_mode():
    for i in range(count):
        ok, bgr = cap.read()
        if not ok:
            raise RuntimeError(f'Missing frame {i}')
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        src = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).float() / 255
        fgr, pha, *rec = model(src, *rec, 0.5)
        matte = pha[0, 0].clamp(0, 1).numpy()
        # Original RGB stays untouched inside the person; model decontamination
        # is used only on partially transparent boundary pixels.
        edge = fgr[0].permute(1, 2, 0).clamp(0, 1).numpy() * 255
        color = np.where((matte > 0.98)[..., None], rgb, edge).astype(np.uint8)
        mask = (matte * 255).round().astype(np.uint8)
        rgba = np.dstack([color, mask])
        alpha.stdin.write(rgba.tobytes())
        packed.stdin.write(np.concatenate([color, np.repeat(mask[..., None], 3, axis=2)], axis=1).tobytes())
        if i == 0:
            Image.fromarray(rgba).save(OUT / 'hero-cutout.png', optimize=True)
        if i % 48 == 0 or i == count-1:
            bg = np.full_like(color, (110, 110, 110))
            preview = color * matte[..., None] + bg * (1-matte[..., None])
            Image.fromarray(preview.astype(np.uint8)).save(WORK / f'preview-{i:03}.jpg')
            print(f'Processed {i+1}/{count}', flush=True)
alpha.stdin.close()
packed.stdin.close()
assert alpha.wait() == 0 and packed.wait() == 0
cap.release()
print(f'Complete: {w}x{h}, {fps} fps, {count} frames', flush=True)
