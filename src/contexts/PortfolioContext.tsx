import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PortfolioData } from '../types/portfolio';
import { firebaseStorage } from '../services/firebaseStorage';

interface PortfolioContextType {
    data: PortfolioData;
    loading: boolean;
    updateData: (newData: PortfolioData) => Promise<void>;
    updateSection: <K extends keyof PortfolioData>(section: K, sectionData: PortfolioData[K]) => Promise<void>;
    refresh: () => Promise<void>;
    syncWithGitHub: () => Promise<boolean>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<PortfolioData>({} as PortfolioData);
    const [loading, setLoading] = useState(true);

    // Initialize data and set up real-time listener
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                const fetchedData = await firebaseStorage.getData();
                setData(fetchedData);
            } catch (error) {
                console.error('Failed to fetch portfolio data:', error);
                // Fallback to initial data if fetch fails (offline mode)
                // We import initialData from direct import, not from firebaseStorage internal fallback
                const { initialData } = await import('../data/initialData');
                setData(initialData);
            } finally {
                setLoading(false);
            }
        };

        initializeData();

        // Subscribe to real-time changes
        const unsubscribe = firebaseStorage.subscribeToChanges((updatedData) => {
            console.log('🔄 Real-time update received from Firestore');
            setData(updatedData);
        });

        return () => unsubscribe();
    }, []);

    const refresh = async () => {
        const refreshedData = await firebaseStorage.getData();
        setData(refreshedData);
    };

    const updateData = async (newData: PortfolioData) => {
        await firebaseStorage.setData(newData);
        setData(newData);
    };

    const updateSection = async <K extends keyof PortfolioData>(
        section: K,
        sectionData: PortfolioData[K]
    ) => {
        await firebaseStorage.updateSection(section, sectionData);
        await refresh();
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
                await updateSection('profile', updatedProfile);
                return true;
            }
        } catch (error) {
            console.error('Failed to sync with GitHub:', error);
        }
        return false;
    };

    return (
        <PortfolioContext.Provider value={{ data, loading, updateData, updateSection, refresh, syncWithGitHub }}>
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
