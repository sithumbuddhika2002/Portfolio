import type { Settings } from '../types/portfolio';

export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type?: string;
    duration?: number;
}

export const generateSha1Signature = async (
    paramsToSign: Record<string, string | number>,
    apiSecret: string
): Promise<string> => {
    const sortedKeys = Object.keys(paramsToSign).sort();
    const parameterString = sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join('&');
    const stringToSign = parameterString + apiSecret;

    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const getCloudinaryCredentials = (settings?: Settings) => {
    const cloudName =
        settings?.cloudinary?.cloudName?.trim() ||
        (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string)?.trim() ||
        'il2hd5tl';

    const apiKey =
        settings?.cloudinary?.apiKey?.trim() ||
        (import.meta.env.VITE_CLOUDINARY_API_KEY as string)?.trim() ||
        '399392719424744';

    const apiSecret =
        settings?.cloudinary?.apiSecret?.trim() ||
        (import.meta.env.VITE_CLOUDINARY_API_SECRET as string)?.trim() ||
        'ehqNtsQ6S22z5NusmjM6rOorGp4';

    const uploadPreset =
        settings?.cloudinary?.uploadPreset?.trim() ||
        (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string)?.trim() ||
        '';

    return { cloudName, apiKey, apiSecret, uploadPreset };
};

export const isCloudinaryConfigured = (settings?: Settings): boolean => {
    const { cloudName, apiKey, apiSecret, uploadPreset } = getCloudinaryCredentials(settings);
    return Boolean(cloudName && ((apiKey && apiSecret) || uploadPreset));
};

export const uploadMediaToCloudinary = async (
    file: File,
    settings?: Settings,
    options?: {
        resourceType?: 'image' | 'video' | 'auto';
        onProgress?: (percent: number) => void;
    }
): Promise<CloudinaryUploadResponse> => {
    const { cloudName, apiKey, apiSecret, uploadPreset } = getCloudinaryCredentials(settings);

    if (!cloudName) {
        throw new Error('Cloudinary Cloud Name is required.');
    }

    const formData = new FormData();
    formData.append('file', file);

    if (apiKey && apiSecret) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = await generateSha1Signature({ timestamp }, apiSecret);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
    } else if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
    } else {
        throw new Error('Please configure API Key/Secret or Upload Preset for Cloudinary uploads.');
    }

    const resourceType = options?.resourceType || 'auto';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    return new Promise<CloudinaryUploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        if (options?.onProgress) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && event.total > 0) {
                    const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
                    options.onProgress?.(percent);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
                    resolve(data);
                } catch {
                    reject(new Error('Cloudinary Upload Error: Invalid response format.'));
                }
            } else {
                let errorMessage = `Upload failed with status ${xhr.status}`;
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    if (errorData?.error?.message) {
                        errorMessage = errorData.error.message;
                    }
                } catch {
                    // ignore JSON parse error on error response
                }
                reject(new Error(`Cloudinary Upload Error: ${errorMessage}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Cloudinary Upload Error: Network error occurred during upload.'));
        };

        xhr.send(formData);
    });
};

export const uploadToCloudinary = async (
    file: File,
    settings?: Settings
): Promise<string> => {
    const data = await uploadMediaToCloudinary(file, settings, { resourceType: 'image' });
    return data.secure_url;
};

export const testCloudinaryConfig = async (
    cloudName: string,
    uploadPreset?: string,
    apiKey?: string,
    apiSecret?: string
): Promise<boolean> => {
    if (!cloudName.trim()) {
        throw new Error('Please enter Cloud Name');
    }

    const dummyPngBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await fetch(dummyPngBase64);
    const blob = await res.blob();
    const testFile = new File([blob], 'test.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', testFile);

    if (apiKey?.trim() && apiSecret?.trim()) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = await generateSha1Signature({ timestamp }, apiSecret.trim());
        formData.append('api_key', apiKey.trim());
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
    } else if (uploadPreset?.trim()) {
        formData.append('upload_preset', uploadPreset.trim());
    } else {
        throw new Error('Please provide either (API Key + API Secret) or an Upload Preset.');
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`;

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Invalid Cloudinary credentials');
    }

    return true;
};
