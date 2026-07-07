import type { PortfolioData } from '../types/portfolio';

export const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const compressBase64 = (base64Str: string, maxWidth: number, quality: number): Promise<string> => {
    if (!base64Str || !base64Str.startsWith('data:image')) {
        return Promise.resolve(base64Str);
    }
    // SVGs are vector graphic code and do not need visual canvas compression
    if (base64Str.includes('image/svg+xml')) {
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
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            } else {
                resolve(base64Str);
            }
        };
        img.onerror = () => resolve(base64Str);
    });
};

export const compressAllPortfolioData = async (data: PortfolioData): Promise<PortfolioData> => {
    const copy = JSON.parse(JSON.stringify(data)) as PortfolioData;

    // 1. Profile images (max 300px, quality 0.5)
    if (copy.profile) {
        if (copy.profile.image) {
            copy.profile.image = await compressBase64(copy.profile.image, 300, 0.5);
        }
        if (copy.profile.aboutImage) {
            copy.profile.aboutImage = await compressBase64(copy.profile.aboutImage, 300, 0.5);
        }
    }

    // 2. Skills icons (max 64px, quality 0.5)
    if (copy.skills && Array.isArray(copy.skills)) {
        for (let i = 0; i < copy.skills.length; i++) {
            const skill = copy.skills[i];
            if (skill.icon) {
                skill.icon = await compressBase64(skill.icon, 64, 0.5);
            }
        }
    }

    // 3. Projects images (max 500px, quality 0.5)
    if (copy.projects && Array.isArray(copy.projects)) {
        for (let i = 0; i < copy.projects.length; i++) {
            const project = copy.projects[i];
            if (project.image) {
                project.image = await compressBase64(project.image, 500, 0.5);
            }
        }
    }

    return copy;
};
