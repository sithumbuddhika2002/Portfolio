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
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Settings</h1>
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

                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    Cloudinary Image Hosting (Optional) ☁️
                                </h3>
                                {isCloudinaryConfigured(settings) ? (
                                    <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                                        Cloudinary Active ✅
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
                                        HD Local Fallback Active 🖼️
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                Connect your free Cloudinary account to store full-resolution HD images on CDN and keep Firebase database lightweight.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Cloud Name</label>
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
                                    <label className="block text-sm font-semibold mb-1">API Key</label>
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
                                    <label className="block text-sm font-semibold mb-1">API Secret</label>
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
                                    <label className="block text-sm font-semibold mb-1">Upload Preset (Optional)</label>
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
                                        placeholder="Unsigned preset name (if not using API Secret)"
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

                        <motion.button
                            onClick={handleSaveSettings}
                            className="btn-primary flex items-center justify-center gap-2"
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
                            className="btn-primary flex items-center justify-center gap-2"
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
