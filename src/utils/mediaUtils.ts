import type { Project } from '../types/portfolio';

const VIDEO_EXTENSION_REGEX = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;
const CLOUDINARY_VIDEO_UPLOAD_MARKER = '/video/upload/';

export const isVideoFile = (file: File): boolean => {
    if (file.type.startsWith('video/')) {
        return true;
    }
    return VIDEO_EXTENSION_REGEX.test(file.name);
};

export const isVideoUrl = (url?: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    return VIDEO_EXTENSION_REGEX.test(trimmed) || trimmed.includes(CLOUDINARY_VIDEO_UPLOAD_MARKER);
};

/**
 * Inserts Cloudinary transformation parameters after `/video/upload/` if not already transformed.
 */
const injectCloudinaryVideoTransform = (url: string, transform: string): string => {
    if (!url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_VIDEO_UPLOAD_MARKER)) {
        return url;
    }

    const markerIndex = url.indexOf(CLOUDINARY_VIDEO_UPLOAD_MARKER);
    const prefix = url.slice(0, markerIndex + CLOUDINARY_VIDEO_UPLOAD_MARKER.length);
    const rest = url.slice(markerIndex + CLOUDINARY_VIDEO_UPLOAD_MARKER.length);

    // If rest starts with a version segment (v12345/...) or a single public_id without transformations,
    // inject our transformation directly. If it already has a transformation segment (e.g. contains commas or f_/w_/q_/so_), replace it.
    const firstSlash = rest.indexOf('/');
    const firstSegment = firstSlash === -1 ? '' : rest.slice(0, firstSlash);
    const isVersionSegment = /^v\d+$/.test(firstSegment);
    const looksLikeTransform =
        firstSegment !== '' &&
        !isVersionSegment &&
        (firstSegment.includes(',') || /^(f_|q_|w_|h_|c_|so_|ac_|vc_|du_)/.test(firstSegment));

    if (looksLikeTransform) {
        const remaining = rest.slice(firstSlash + 1);
        return `${prefix}${transform}/${remaining}`;
    }

    return `${prefix}${transform}/${rest}`;
};

export const getOptimizedCloudinaryVideoUrl = (
    url: string,
    variant: 'card' | 'modal'
): string => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_VIDEO_UPLOAD_MARKER)) {
        return url;
    }

    const transform =
        variant === 'modal'
            ? 'f_auto,q_auto,w_1280,ac_none'
            : 'f_auto,q_auto:eco,w_720,ac_none';

    return injectCloudinaryVideoTransform(url, transform);
};

export const getCloudinaryVideoPosterUrl = (
    url: string,
    width: number = 720
): string | undefined => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_VIDEO_UPLOAD_MARKER)) {
        return undefined;
    }

    const transformed = injectCloudinaryVideoTransform(url, `so_0,f_auto,q_auto,w_${width}`);
    const [baseUrl, query] = transformed.split('?');
    const jpgUrl = VIDEO_EXTENSION_REGEX.test(baseUrl)
        ? baseUrl.replace(VIDEO_EXTENSION_REGEX, '.jpg')
        : `${baseUrl}.jpg`;

    return query ? `${jpgUrl}?${query}` : jpgUrl;
};

export const getProjectMedia = (
    project: Pick<Project, 'image' | 'mediaType' | 'videoUrl'>
): { isVideo: boolean; src: string; poster?: string } => {
    const isVideo =
        (project.mediaType === 'video' && Boolean(project.videoUrl)) ||
        isVideoUrl(project.videoUrl) ||
        isVideoUrl(project.image);

    if (!isVideo) {
        return {
            isVideo: false,
            src: project.image,
            poster: undefined,
        };
    }

    const src = project.videoUrl || project.image;
    const poster =
        project.image && !isVideoUrl(project.image)
            ? project.image
            : getCloudinaryVideoPosterUrl(src);

    return {
        isVideo: true,
        src,
        poster,
    };
};
