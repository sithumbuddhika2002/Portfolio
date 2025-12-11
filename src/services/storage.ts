import type { PortfolioData } from '../types/portfolio';
import { initialData } from '../data/initialData';

const STORAGE_KEY = 'portfolio_data';

export const storage = {
    // Get all portfolio data
    getData: (): PortfolioData => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            // Initialize with default data if not exists
            storage.setData(initialData);
            return initialData;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialData;
        }
    },

    // Set all portfolio data
    setData: (data: PortfolioData): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },

    // Update specific section
    updateSection: <K extends keyof PortfolioData>(
        section: K,
        data: PortfolioData[K]
    ): void => {
        const currentData = storage.getData();
        currentData[section] = data;
        storage.setData(currentData);
    },

    // Reset to initial data
    reset: (): void => {
        storage.setData(initialData);
    },

    // Export data as JSON
    exportData: (): string => {
        return JSON.stringify(storage.getData(), null, 2);
    },

    // Import data from JSON
    importData: (jsonString: string): boolean => {
        try {
            const data = JSON.parse(jsonString) as PortfolioData;
            storage.setData(data);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },
};
