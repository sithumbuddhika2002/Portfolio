import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import type { PortfolioData } from '../types/portfolio';
import { initialData } from '../data/initialData';
import { storage } from './storage';

const COLLECTION_NAME = 'portfolio';
const DOCUMENT_ID = 'data';

export const firebaseStorage = {
    // Get all portfolio data
    getData: async (): Promise<PortfolioData> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as PortfolioData;
                // Update local cache
                storage.setData(data);
                return data;
            } else {
                // Initialize with default data if not exists
                await firebaseStorage.setData(initialData);
                return initialData;
            }
        } catch (error) {
            console.error('Error reading from Firestore:', error);
            // Fallback to local storage
            console.log('⚠️ Falling back to local storage');
            return storage.getData();
        }
    },

    // Set all portfolio data
    setData: async (data: PortfolioData): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
            await setDoc(docRef, data);
            // Sync with local storage
            storage.setData(data);
            console.log('✅ Data saved to Firestore');
        } catch (error) {
            console.error('Error writing to Firestore:', error);
            // Still save to local storage even if Firestore fails
            storage.setData(data);
            throw error;
        }
    },

    // Update specific section
    updateSection: async <K extends keyof PortfolioData>(
        section: K,
        data: PortfolioData[K]
    ): Promise<void> => {
        const currentData = await firebaseStorage.getData();
        currentData[section] = data;
        await firebaseStorage.setData(currentData);
    },

    // Reset to initial data
    reset: async (): Promise<void> => {
        await firebaseStorage.setData(initialData);
        storage.reset();
    },

    // Export data as JSON
    exportData: async (): Promise<string> => {
        const data = await firebaseStorage.getData();
        return JSON.stringify(data, null, 2);
    },

    // Import data from JSON
    importData: async (jsonString: string): Promise<boolean> => {
        try {
            const data = JSON.parse(jsonString) as PortfolioData;
            await firebaseStorage.setData(data);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    // Subscribe to real-time changes
    subscribeToChanges: (callback: (data: PortfolioData) => void): Unsubscribe => {
        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data() as PortfolioData);
            }
        }, (error) => {
            console.error('Error listening to Firestore changes:', error);
        });
    },

    // Initialize data if empty
    initializeData: async (): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await firebaseStorage.setData(initialData);
                console.log('✅ Initialized Firestore with default data');
            }
        } catch (error) {
            console.error('Error initializing Firestore:', error);
        }
    },
};
