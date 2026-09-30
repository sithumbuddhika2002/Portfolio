import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useToast } from '../../contexts/ToastContext';
import { uploadImageSmart } from '../../utils/fileUtils';

export const ProfileEditor: React.FC = () => {
    const { data, updateSection, loading } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const getProfileWithDefaults = (p: typeof data.profile) => ({
        name: p?.name ?? '',
        title: p?.title ?? '',
        titles: p?.titles && p.titles.length > 0 ? p.titles : (p?.title ? [p.title] : []),
        bio: p?.bio ?? '',
        aboutMe: p?.aboutMe ?? '',
        image: p?.image ?? '',
        aboutImage: p?.aboutImage ?? '',
        email: p?.email ?? '',
        phone: p?.phone ?? '',
        location: p?.location ?? '',
        resumeUrl: p?.resumeUrl ?? ''
    });

    const [profile, setProfile] = useState(getProfileWithDefaults(data.profile));
    const [newTitleInput, setNewTitleInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingAbout, setIsUploadingAbout] = useState(false);

    const handleAddTitle = () => {
        if (!newTitleInput.trim()) return;
        const currentTitles = profile.titles || [];
        const updated = [...currentTitles, newTitleInput.trim()];
        setProfile((prev) => ({
            ...prev,
            titles: updated,
            title: prev.title || updated[0] || '',
        }));
        setNewTitleInput('');
    };

    const handleRemoveTitle = (indexToRemove: number) => {
        const updated = (profile.titles || []).filter((_, i) => i !== indexToRemove);
        setProfile((prev) => ({
            ...prev,
            titles: updated,
            title: updated[0] || prev.title,
        }));
    };

    const handleTitleChange = (index: number, value: string) => {
        const updated = [...(profile.titles || [])];
        updated[index] = value;
        setProfile((prev) => ({
            ...prev,
            titles: updated,
            title: index === 0 ? value : prev.title,
        }));
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: 'image' | 'aboutImage'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                if (fieldName === 'image') setIsUploadingProfile(true);
                else setIsUploadingAbout(true);
                const { url, source } = await uploadImageSmart(file, data.settings, { maxWidth: 1600, quality: 0.88 });
                setProfile((prev) => ({ ...prev, [fieldName]: url }));
                const badge = source === 'cloudinary' ? 'Cloudinary ☁️' : 'HD Crisp 🖼️';
                showSuccess(`${fieldName === 'image' ? 'Profile' : 'About Me'} image uploaded via ${badge}! 🎉`);
            } catch (error) {
                console.error('Failed to upload image:', error);
                showError('Failed to upload image. Please try again.');
            } finally {
                if (fieldName === 'image') setIsUploadingProfile(false);
                else setIsUploadingAbout(false);
            }
        }
    };

    // Update local state when data loads
    useEffect(() => {
        if (data.profile) {
            setProfile(getProfileWithDefaults(data.profile));
        }
    }, [data.profile]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSection('profile', profile);
            showSuccess('Profile updated successfully! 🎉');
        } catch (error) {
            console.error('Error saving profile:', error);
            showError('Failed to save changes. Please check your Firebase configuration.');
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading while data loads
    if (loading || !data.profile) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }



    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full pb-10">
            {/* Header with Save Button on top right */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Edit Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update your personal information, titles, bio, and images
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        type="button"
                        onClick={handleSubmit}
                        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </motion.button>
                </div>
            </motion.div>

            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="w-full space-y-6"
            >
                {/* 1. Basic Details Card */}
                <div className="card w-full space-y-6">
                    <h2 className="text-lg font-bold font-display text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-gray-800">
                        Personal Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Primary Title</label>
                            <input
                                type="text"
                                name="title"
                                value={profile.title}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Multiple Hero Titles (Animated with TextRoll) */}
                    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>Rotating Hero Titles</span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium border border-primary-500/20">
                                        TextRoll Animation
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    These titles cycle smoothly in the Hero section using the 3D TextRoll cylinder flip animation.
                                </p>
                            </div>
                        </div>

                        {/* Titles List */}
                        <div className="space-y-2.5">
                            {(profile.titles || []).map((t, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-gray-400 w-6 text-right flex-shrink-0">{idx + 1}.</span>
                                    <input
                                        type="text"
                                        value={t}
                                        onChange={(e) => handleTitleChange(idx, e.target.value)}
                                        className="input-field py-2 text-sm flex-1 min-w-0"
                                        placeholder="e.g. Full Stack Developer & Designer"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTitle(idx)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                                        title="Delete title"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Title Input */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <input
                                type="text"
                                value={newTitleInput}
                                onChange={(e) => setNewTitleInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTitle();
                                    }
                                }}
                                placeholder="Add another rotating title..."
                                className="input-field py-2 text-sm flex-1 min-w-0"
                            />
                            <button
                                type="button"
                                onClick={handleAddTitle}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                            >
                                <PlusIcon className="w-4 h-4" />
                                <span>Add Title</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Bio & About Card */}
                <div className="card w-full space-y-6">
                    <h2 className="text-lg font-bold font-display text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-gray-800">
                        Bio & Descriptions
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Bio (Hero Section Tagline)
                            </label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                rows={5}
                                className="input-field resize-none"
                                placeholder="Short punchy tagline for the top hero banner"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                About Me Description
                            </label>
                            <textarea
                                name="aboutMe"
                                value={profile.aboutMe}
                                onChange={handleChange}
                                rows={5}
                                className="input-field resize-none"
                                placeholder="Detailed professional bio shown in the About Me section"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Visual Media Images Card */}
                <div className="card w-full space-y-6">
                    <h2 className="text-lg font-bold font-display text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-gray-800">
                        Profile & Avatar Images
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Image */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Profile Image (Hero Section)
                            </label>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="url"
                                        name="image"
                                        value={profile.image}
                                        onChange={handleChange}
                                        className="input-field flex-1 min-w-0"
                                        placeholder="Enter URL or upload image"
                                        required
                                    />
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'image')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isUploadingProfile}
                                        />
                                        <button
                                            type="button"
                                            className={`w-full sm:w-auto px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap cursor-pointer text-sm font-medium ${
                                                isUploadingProfile ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {isUploadingProfile ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </div>
                                {profile.image && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center">
                                        <img
                                            src={profile.image}
                                            alt="Profile Preview"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* About Me Image */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                About Me Image (Optional)
                            </label>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="url"
                                        name="aboutImage"
                                        value={profile.aboutImage || ''}
                                        onChange={handleChange}
                                        className="input-field flex-1 min-w-0"
                                        placeholder="Leave empty to use Profile Image"
                                    />
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'aboutImage')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isUploadingAbout}
                                        />
                                        <button
                                            type="button"
                                            className={`w-full sm:w-auto px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap cursor-pointer text-sm font-medium ${
                                                isUploadingAbout ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {isUploadingAbout ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </div>
                                {(profile.aboutImage || profile.image) && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center">
                                        <img
                                            src={profile.aboutImage || profile.image}
                                            alt="About Preview"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Contact & Links Card */}
                <div className="card w-full space-y-6">
                    <h2 className="text-lg font-bold font-display text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-gray-800">
                        Contact & Links
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={profile.location}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Resume / CV Link</label>
                            <input
                                type="url"
                                name="resumeUrl"
                                value={profile.resumeUrl}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://drive.google.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Submit Action */}
                <div className="flex items-center justify-end pt-2">
                    <motion.button
                        type="submit"
                        className="btn-primary w-full sm:w-auto px-10 py-3 text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving Profile...</span>
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </motion.button>
                </div>
            </motion.form>
        </div>
    );
};

