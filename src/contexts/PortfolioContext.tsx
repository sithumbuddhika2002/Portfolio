import React, { createContext, useContext, useState } from 'react';
import type { PortfolioData } from '../types/portfolio';
import { storage } from '../services/storage';

interface PortfolioContextType {
    data: PortfolioData;
    updateData: (newData: PortfolioData) => void;
    updateSection: <K extends keyof PortfolioData>(section: K, sectionData: PortfolioData[K]) => void;
    refresh: () => void;
    syncWithGitHub: () => Promise<boolean>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<PortfolioData>(storage.getData());

    const refresh = () => {
        setData(storage.getData());
    };

    const updateData = (newData: PortfolioData) => {
        storage.setData(newData);
        setData(newData);
    };

    const updateSection = <K extends keyof PortfolioData>(
        section: K,
        sectionData: PortfolioData[K]
    ) => {
        storage.updateSection(section, sectionData);
        refresh();
    };

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

    return (
        <PortfolioContext.Provider value={{ data, updateData, updateSection, refresh, syncWithGitHub }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolioData = () => {
    const context = useContext(PortfolioContext);
    if (context === undefined) {
        throw new Error('usePortfolioData must be used within a PortfolioProvider');
    }
    return context;
};
