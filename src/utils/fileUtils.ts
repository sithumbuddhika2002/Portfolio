import type { PortfolioData, Settings } from '../types/portfolio';
import { isCloudinaryConfigured, uploadToCloudinary } from '../services/cloudinaryService';

export const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * High-quality image compressor for crisp local fallback display.
 * Default max width 1600px, quality 0.88, with high-quality canvas smoothing.
 */
export const compressImage = (
    file: File,
    maxWidth: number = 1600,
    quality: number = 0.88
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.type === 'image/svg+xml') {
            convertFileToBase64(file).then(resolve).catch(reject);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Only downscale if larger than maxWidth
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Enable high quality image smoothing for crisp resizing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height);

                // Preserve PNG for transparent images or convert to WebP / high-quality JPEG
                let mimeType = 'image/jpeg';
                if (file.type === 'image/png') {
                    mimeType = 'image/png';
                } else if (file.type === 'image/webp') {
                    mimeType = 'image/webp';
                }

                const compressedBase64 = canvas.toDataURL(mimeType, quality);
                resolve(compressedBase64);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const compressBase64 = (
    base64Str: string,
    maxWidth: number = 1600,
    quality: number = 0.88
): Promise<string> => {
    if (!base64Str || typeof base64Str !== 'string') {
        return Promise.resolve(base64Str || '');
    }

    // Do not compress external HTTP/HTTPS URLs
    if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
        return Promise.resolve(base64Str);
    }

    if (!base64Str.startsWith('data:image')) {
        return Promise.resolve(base64Str);
    }

    // SVGs do not need visual canvas compression
    if (base64Str.includes('image/svg+xml')) {
        return Promise.resolve(base64Str);
    }

    // If base64 string is reasonable size (< 500KB), preserve as is to prevent quality loss
    if (base64Str.length < 700000) {
        return Promise.resolve(base64Str);
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                const isPng = base64Str.includes('image/png');
                resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality));
            } else {
                resolve(base64Str);
            }
        };
        img.onerror = () => resolve(base64Str);
    });
};

/**
 * Ensures portfolio data is preserved exactly as stored.
 */
export const compressAllPortfolioData = async (data: PortfolioData): Promise<PortfolioData> => {
    return Promise.resolve(data);
};

/**
 * Smart upload function:
 * Uses Cloudinary if configured, otherwise falls back to crisp local compression.
 */
export const uploadImageSmart = async (
    file: File,
    settings?: Settings,
    options?: { maxWidth?: number; quality?: number }
): Promise<{ url: string; source: 'cloudinary' | 'local' }> => {
    if (isCloudinaryConfigured(settings)) {
        try {
            const cloudinaryUrl = await uploadToCloudinary(file, settings);
            return { url: cloudinaryUrl, source: 'cloudinary' };
        } catch (error) {
            console.warn('Cloudinary upload failed, falling back to crisp local upload:', error);
        }
    }

    // High quality local fallback
    const maxWidth = options?.maxWidth ?? 1600;
    const quality = options?.quality ?? 0.88;
    const localBase64 = await compressImage(file, maxWidth, quality);
    return { url: localBase64, source: 'local' };
};
