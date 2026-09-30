import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { auth } from '../../services/auth';
import { firebaseStorage } from '../../services/firebaseStorage';
import { useToast } from '../../contexts/ToastContext';


import { isCloudinaryConfigured, testCloudinaryConfig } from '../../services/cloudinaryService';

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
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
    const [isTestingCloudinary, setIsTestingCloudinary] = useState(false);

    const handleTestCloudinary = async () => {
        const cloudName = settings.cloudinary?.cloudName || 'il2hd5tl';
        const uploadPreset = settings.cloudinary?.uploadPreset || '';
        const apiKey = settings.cloudinary?.apiKey || '399392719424744';
        const apiSecret = settings.cloudinary?.apiSecret || 'ehqNtsQ6S22z5NusmjM6rOorGp4';

        if (!cloudName.trim()) {
            showError('Please enter Cloud Name first.');
            return;
        }
        setIsTestingCloudinary(true);
        try {
            await testCloudinaryConfig(cloudName, uploadPreset, apiKey, apiSecret);
            showSuccess('Cloudinary connection verified successfully! ☁️🎉');
        } catch (err: any) {
            console.error('Cloudinary Test Error:', err);
            showError(`Cloudinary Test Failed: ${err.message || 'Check your keys.'}`);
        } finally {
            setIsTestingCloudinary(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            await updateSection('settings', settings);
            await updateSection('contact', contact);
            showSuccess('Settings saved successfully! 🎉');
        } catch (error) {
            console.error('Error saving settings:', error);
            showError('Failed to save settings. Please try again.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleUpdateCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        if (credentials.password !== credentials.confirmPassword) {
            showError('Passwords do not match!');
            return;
        }
        if (credentials.username && credentials.password) {
            setIsUpdatingCredentials(true);
            try {
                // Simulate network delay to show loading animation safely
                await new Promise(resolve => setTimeout(resolve, 500));
                await auth.updateCredentials(credentials.username, credentials.password);
                setCredentials({ username: '', password: '', confirmPassword: '' });
                showSuccess('Credentials updated successfully! 🔒');
            } catch (error) {
                console.error('Error updating credentials:', error);
                showError('Failed to update credentials. Please try again.');
            } finally {
                setIsUpdatingCredentials(false);
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
        <div className="w-full pb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configure your portfolio, account credentials, and system settings
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={handleSaveSettings}
                        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={isSavingSettings}
                    >
                        {isSavingSettings ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </motion.button>
                </div>
            </motion.div>

            <div className="space-y-8 w-full">
                {/* Site Settings */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card w-full space-y-6">
                    <h2 className="text-xl font-bold font-display pb-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                        General Site Settings
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tagline</label>
                            <input
                                type="text"
                                value={settings.tagline}
                                onChange={(e) =>
                                    setSettings({ ...settings, tagline: e.target.value })
                                }
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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
                                className="input-field cursor-pointer"
                            >
                                <option value="none">None</option>
                                <option value="christmas">Christmas (Snow)</option>
                                <option value="newyear">New Year (Fireworks)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Enable festive interactive animations for specific holidays.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold font-display pt-4 pb-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                        Contact Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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

                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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
                    </div>

                    <h3 className="text-lg font-bold font-display pt-4 pb-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                        Social Profile Links
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(contact.social).map(([platform, url]) => (
                            <div key={platform}>
                                <label className="block text-sm font-semibold mb-1.5 capitalize text-gray-700 dark:text-gray-300">
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
                                    className="input-field text-sm"
                                    placeholder={`https://${platform}.com/...`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                Cloudinary Image Hosting (Optional) ☁️
                            </h3>
                            {isCloudinaryConfigured(settings) ? (
                                <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                                    Cloudinary Active ✅
                                </span>
                            ) : (
                                <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
                                    HD Local Fallback Active 🖼️
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                            Connect your free Cloudinary account to store full-resolution HD images on CDN and keep Firebase database lightweight.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Cloud Name</label>
                                <input
                                    type="text"
                                    value={settings.cloudinary?.cloudName ?? 'il2hd5tl'}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            cloudinary: {
                                                ...(settings.cloudinary || {}),
                                                cloudName: e.target.value,
                                            },
                                        })
                                    }
                                    className="input-field"
                                    placeholder="il2hd5tl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">API Key</label>
                                <input
                                    type="text"
                                    value={settings.cloudinary?.apiKey ?? '399392719424744'}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            cloudinary: {
                                                ...(settings.cloudinary || {}),
                                                apiKey: e.target.value,
                                            },
                                        })
                                    }
                                    className="input-field"
                                    placeholder="399392719424744"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">API Secret</label>
                                <input
                                    type="password"
                                    value={settings.cloudinary?.apiSecret ?? 'ehqNtsQ6S22z5NusmjM6rOorGp4'}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            cloudinary: {
                                                ...(settings.cloudinary || {}),
                                                apiSecret: e.target.value,
                                            },
                                        })
                                    }
                                    className="input-field"
                                    placeholder="••••••••••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Upload Preset (Optional)</label>
                                <input
                                    type="text"
                                    value={settings.cloudinary?.uploadPreset || ''}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            cloudinary: {
                                                ...(settings.cloudinary || {}),
                                                uploadPreset: e.target.value,
                                            },
                                        })
                                    }
                                    className="input-field"
                                    placeholder="Unsigned preset"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4 items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <strong>Quick Setup:</strong> Cloudinary Console ➔ Settings ➔ Upload ➔ Add Unsigned Upload Preset.
                            </div>
                            <button
                                type="button"
                                onClick={handleTestCloudinary}
                                disabled={isTestingCloudinary}
                                className="px-3 py-1.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                {isTestingCloudinary ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    'Test Connection 🧪'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <motion.button
                            onClick={handleSaveSettings}
                            className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSavingSettings}
                        >
                            {isSavingSettings ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Settings'
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Change Credentials */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card w-full space-y-6">
                    <h2 className="text-xl font-bold font-display pb-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                        Change Admin Credentials
                    </h2>

                    <form onSubmit={handleUpdateCredentials} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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
                        </div>

                        <div className="flex justify-end">
                            <motion.button
                                type="submit"
                                className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isUpdatingCredentials}
                            >
                                {isUpdatingCredentials ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Credentials'
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>

                {/* Data Management */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card w-full space-y-6">
                    <h2 className="text-xl font-bold font-display pb-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                        Data Management & Backups
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Export Data */}
                        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Export Data</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                    Download all your portfolio database records as a complete JSON backup file.
                                </p>
                            </div>
                            <button onClick={handleExport} className="btn-secondary w-full text-center text-sm font-semibold cursor-pointer">
                                Export Data (JSON)
                            </button>
                        </div>

                        {/* Import Data */}
                        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Import Data</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                    Upload a previously exported JSON backup file to restore portfolio data.
                                </p>
                            </div>
                            <label className="btn-secondary w-full text-center text-sm font-semibold cursor-pointer block relative">
                                <span>Choose JSON File</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="sr-only"
                                />
                            </label>
                        </div>

                        {/* Reset All Data */}
                        <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-red-600 dark:text-red-400 mb-1">Reset All Data</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                    Reset portfolio to initial demo data. Warning: this action cannot be undone.
                                </p>
                            </div>
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
                                className="px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold cursor-pointer w-full"
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

