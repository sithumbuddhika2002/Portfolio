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

    return {
        data,
        updateData,
        updateSection,
        refresh,
    };
};
