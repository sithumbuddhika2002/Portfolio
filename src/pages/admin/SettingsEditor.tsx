import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { auth } from '../../services/auth';
import { storage } from '../../services/storage';

export const SettingsEditor: React.FC = () => {
    const { data, updateSection, refresh } = usePortfolioData();
    const [settings, setSettings] = useState(data.settings);
    const [contact, setContact] = useState(data.contact);
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [saved, setSaved] = useState(false);
    const [credentialsSaved, setCredentialsSaved] = useState(false);

    const handleSaveSettings = () => {
        updateSection('settings', settings);
        updateSection('contact', contact);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleUpdateCredentials = (e: React.FormEvent) => {
        e.preventDefault();
        if (credentials.password !== credentials.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        if (credentials.username && credentials.password) {
            auth.updateCredentials(credentials.username, credentials.password);
            setCredentialsSaved(true);
            setCredentials({ username: '', password: '', confirmPassword: '' });
            setTimeout(() => setCredentialsSaved(false), 2000);
        }
    };

    const handleExport = () => {
        const jsonData = storage.exportData();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio-data.json';
        a.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                const success = storage.importData(content);
                if (success) {
                    refresh();
                    alert('Data imported successfully!');
                } else {
                    alert('Failed to import data. Please check the file format.');
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
                            {saved ? '✓ Saved!' : 'Save Settings'}
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
                            {credentialsSaved ? '✓ Credentials Updated!' : 'Update Credentials'}
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
                                onClick={() => {
                                    if (
                                        confirm(
                                            'Are you sure you want to reset all data? This cannot be undone.'
                                        )
                                    ) {
                                        storage.reset();
                                        refresh();
                                        alert('Data has been reset to defaults.');
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
