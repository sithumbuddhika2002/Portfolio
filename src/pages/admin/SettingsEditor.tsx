import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { auth } from '../../services/auth';
import { firebaseStorage } from '../../services/firebaseStorage';
import { useToast } from '../../contexts/ToastContext';


export const SettingsEditor: React.FC = () => {
    const { data, updateSection, refresh } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const [settings, setSettings] = useState(data.settings || { siteTitle: '', tagline: '', metaDescription: '', season: 'none' as const });
    const [contact, setContact] = useState(data.contact || { email: '', phone: '', location: '', social: {} });
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });

    const handleSaveSettings = async () => {
        try {
            await updateSection('settings', settings);
            await updateSection('contact', contact);
            showSuccess('Settings saved successfully! 🎉');
        } catch (error) {
            console.error('Error saving settings:', error);
            showError('Failed to save settings. Please try again.');
        }
    };

    const handleUpdateCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        if (credentials.password !== credentials.confirmPassword) {
            showError('Passwords do not match!');
            return;
        }
        if (credentials.username && credentials.password) {
            try {
                await auth.updateCredentials(credentials.username, credentials.password);
                setCredentials({ username: '', password: '', confirmPassword: '' });
                showSuccess('Credentials updated successfully! 🔒');
            } catch (error) {
                console.error('Error updating credentials:', error);
                showError('Failed to update credentials. Please try again.');
            }
        }
    };

    const handleExport = async () => {
        try {
            const jsonData = await firebaseStorage.exportData();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'portfolio-data.json';
            a.click();
            showSuccess('Data exported successfully! 💾');
        } catch (error) {
            console.error('Error exporting data:', error);
            showError('Failed to export data. Please try again.');
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const content = event.target?.result as string;
                const success = await firebaseStorage.importData(content);
                if (success) {
                    await refresh();
                    showSuccess('Data imported successfully! 📊');
                } else {
                    showError('Failed to import data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold font-display mb-2">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Configure your portfolio and account settings
                </p>
            </motion.div>

            <div className="space-y-8">
                {/* Site Settings */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6">Site Settings</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Site Title
                            </label>
                            <input
                                type="text"
                                value={settings.siteTitle}
                                onChange={(e) =>
                                    setSettings({ ...settings, siteTitle: e.target.value })
                                }
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Tagline</label>
                            <input
                                type="text"
                                value={settings.tagline}
                                onChange={(e) =>
                                    setSettings({ ...settings, tagline: e.target.value })
                                }
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Meta Description
                            </label>
                            <textarea
                                value={settings.metaDescription}
                                onChange={(e) =>
                                    setSettings({ ...settings, metaDescription: e.target.value })
                                }
                                rows={3}
                                className="input-field resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Seasonal Theme
                            </label>
                            <select
                                value={settings.season || 'none'}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        season: e.target.value as 'none' | 'christmas' | 'newyear',
                                    })
                                }
                                className="input-field"
                            >
                                <option value="none">None</option>
                                <option value="christmas">Christmas (Snow)</option>
                                <option value="newyear">New Year (Fireworks)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Enable global animations for specific holidays.
                            </p>
                        </div>

                        <h3 className="text-xl font-bold mt-8 mb-4">Contact Information</h3>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={contact.email}
                                onChange={(e) =>
                                    setContact({ ...contact, email: e.target.value })
                                }
                                className="input-field"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={contact.phone}
                                onChange={(e) =>
                                    setContact({ ...contact, phone: e.target.value })
                                }
                                className="input-field"
                                placeholder="+1 (234) 567-8900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={contact.location}
                                onChange={(e) =>
                                    setContact({ ...contact, location: e.target.value })
                                }
                                className="input-field"
                                placeholder="City, Country"
                            />
                        </div>

                        <h3 className="text-xl font-bold mt-8 mb-4">Social Links</h3>

                        {Object.entries(contact.social).map(([platform, url]) => (
                            <div key={platform}>
                                <label className="block text-sm font-semibold mb-2 capitalize">
                                    {platform}
                                </label>
                                <input
                                    type="url"
                                    value={url || ''}
                                    onChange={(e) =>
                                        setContact({
                                            ...contact,
                                            social: { ...contact.social, [platform]: e.target.value },
                                        })
                                    }
                                    className="input-field"
                                    placeholder={`https://${platform}.com/yourprofile`}
                                />
                            </div>
                        ))}

                        <motion.button
                            onClick={handleSaveSettings}
                            className="btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Save Settings
                        </motion.button>
                    </div>
                </motion.div>

                {/* Change Credentials */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6">Change Admin Credentials</h2>

                    <form onSubmit={handleUpdateCredentials} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                New Username
                            </label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) =>
                                    setCredentials({ ...credentials, username: e.target.value })
                                }
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials({ ...credentials, password: e.target.value })
                                }
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={credentials.confirmPassword}
                                onChange={(e) =>
                                    setCredentials({
                                        ...credentials,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                className="input-field"
                                required
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Update Credentials
                        </motion.button>
                    </form>
                </motion.div>

                {/* Data Management */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6">Data Management</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Export Data</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Download all your portfolio data as a JSON file
                            </p>
                            <button onClick={handleExport} className="btn-secondary">
                                Export Data
                            </button>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Import Data</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Upload a previously exported JSON file to restore data
                            </p>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  dark:file:bg-primary-900 dark:file:text-primary-300"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold mb-2 text-red-600">Reset All Data</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Reset portfolio to initial demo data (this cannot be undone)
                            </p>
                            <button
                                onClick={async () => {
                                    if (
                                        confirm(
                                            'Are you sure you want to reset all data? This cannot be undone.'
                                        )
                                    ) {
                                        try {
                                            await firebaseStorage.reset();
                                            await refresh();
                                            showSuccess('Data has been reset to defaults.');
                                        } catch (error) {
                                            console.error('Error resetting data:', error);
                                            showError('Failed to reset data. Please try again.');
                                        }
                                    }
                                }}
                                className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
