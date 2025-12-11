import { useState } from 'react';
import type { PortfolioData } from '../types/portfolio';
import { storage } from '../services/storage';

export const usePortfolioData = () => {
    const [data, setData] = useState<PortfolioData>(storage.getData());

    // Refresh data from storage
    const refresh = () => {
        setData(storage.getData());
    };

    // Update entire dataset
    const updateData = (newData: PortfolioData) => {
        storage.setData(newData);
        setData(newData);
    };

    // Update specific section
    const updateSection = <K extends keyof PortfolioData>(
        section: K,
        sectionData: PortfolioData[K]
    ) => {
        storage.updateSection(section, sectionData);
        refresh();
    };

    // Sync with GitHub
    const syncWithGitHub = async () => {
        try {
            const { githubService } = await import('../services/github');
            const githubProfile = await githubService.getProfile();

            if (Object.keys(githubProfile).length > 0) {
                const updatedProfile = {
                    ...data.profile,
                    ...githubProfile,
                };
                updateSection('profile', updatedProfile);
                return true;
            }
        } catch (error) {
            console.error('Failed to sync with GitHub:', error);
        }
        return false;
    };

    return {
        data,
        updateData,
        updateSection,
        refresh,
        syncWithGitHub,
    };
};
