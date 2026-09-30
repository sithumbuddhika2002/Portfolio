export const PROJECT_CATEGORIES = [
    'Personal Projects',
    'University Projects',
    'Corporate Projects',
] as const;

export type StandardProjectCategory = typeof PROJECT_CATEGORIES[number];

/**
 * Normalizes any category string into one of the standard categories or preserves custom ones.
 * Gracefully handles variations like 'Personal projects', 'university projects', 'Coperate Projects', etc.
 */
export const normalizeCategory = (category?: string): string => {
    if (!category) return 'Personal Projects';
    const trimmed = category.trim();
    const lower = trimmed.toLowerCase();

    if (lower.includes('personal')) {
        return 'Personal Projects';
    }
    if (
        lower.includes('university') ||
        lower.includes('academic') ||
        lower.includes('college') ||
        lower.includes('campus') ||
        lower.includes('undergraduate') ||
        lower.includes('sliit')
    ) {
        return 'University Projects';
    }
    if (
        lower.includes('coperate') ||
        lower.includes('corporate') ||
        lower.includes('company') ||
        lower.includes('enterprise') ||
        lower.includes('client') ||
        lower.includes('commercial')
    ) {
        return 'Corporate Projects';
    }

    return trimmed;
};

/**
 * Checks whether a project matches the given tab/filter.
 * 'all' matches everything.
 */
export const isProjectInFilter = (projectCategory: string, filter: string): boolean => {
    if (!filter || filter === 'all') return true;

    const normProject = normalizeCategory(projectCategory).toLowerCase();
    const normFilter = normalizeCategory(filter).toLowerCase();

    return normProject === normFilter;
};

/**
 * Returns color classes for category badges across admin and public sections.
 * Strictly constrained to website design system colors: primary (#0ea5e9), accent (#d946ef), and neutrals.
 * No yellow, no amber, and no unrelated colors.
 */
export const getCategoryBadgeStyle = (category?: string) => {
    const norm = normalizeCategory(category);
    switch (norm) {
        case 'Personal Projects':
            return {
                bg: 'bg-primary-500/10 dark:bg-primary-500/15',
                text: 'text-primary-600 dark:text-primary-400',
                border: 'border-primary-500/25 dark:border-primary-500/30',
                dot: 'bg-primary-500',
            };
        case 'Corporate Projects':
            return {
                bg: 'bg-accent-500/10 dark:bg-accent-500/15',
                text: 'text-accent-600 dark:text-accent-400',
                border: 'border-accent-500/25 dark:border-accent-500/30',
                dot: 'bg-accent-500',
            };
        case 'University Projects':
            return {
                bg: 'bg-gradient-to-r from-primary-500/10 to-accent-500/10',
                text: 'text-primary-700 dark:text-primary-300',
                border: 'border-primary-500/20 dark:border-primary-500/30',
                dot: 'bg-primary-500',
            };
        default:
            return {
                bg: 'bg-gray-100 dark:bg-gray-800',
                text: 'text-gray-700 dark:text-gray-300',
                border: 'border-gray-200 dark:border-gray-700',
                dot: 'bg-gray-400 dark:bg-gray-500',
            };
    }
};
