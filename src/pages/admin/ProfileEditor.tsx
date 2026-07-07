import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useToast } from '../../contexts/ToastContext';
import { compressImage } from '../../utils/fileUtils';

export const ProfileEditor: React.FC = () => {
    const { data, updateSection, loading } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const getProfileWithDefaults = (p: typeof data.profile) => ({
        name: p?.name ?? '',
        title: p?.title ?? '',
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
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingAbout, setIsUploadingAbout] = useState(false);

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: 'image' | 'aboutImage'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                if (fieldName === 'image') setIsUploadingProfile(true);
                else setIsUploadingAbout(true);
                const base64 = await compressImage(file);
                setProfile((prev) => ({ ...prev, [fieldName]: base64 }));
                showSuccess(`${fieldName === 'image' ? 'Profile' : 'About Me'} image uploaded successfully! 🎉`);
            } catch (error) {
                console.error('Failed to convert image:', error);
                showError('Failed to upload image. Please try a smaller file.');
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
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Edit Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Update your personal information and bio
                </p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="card max-w-3xl space-y-6"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Name</label>
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
                        <label className="block text-sm font-semibold mb-2">Title</label>
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

                <div>
                    <label className="block text-sm font-semibold mb-2">Bio (Hero Section Tagline)</label>
                    <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        rows={3}
                        className="input-field resize-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">About Me Description</label>
                    <textarea
                        name="aboutMe"
                        value={profile.aboutMe}
                        onChange={handleChange}
                        rows={5}
                        className="input-field resize-none"
                        placeholder="Detailed professional bio shown in the About Me section"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Profile Image
                        </label>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    name="image"
                                    value={profile.image}
                                    onChange={handleChange}
                                    className="input-field flex-1"
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
                                        className={`px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap ${
                                            isUploadingProfile ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isUploadingProfile ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                            {profile.image && (
                                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                    <img
                                        src={profile.image}
                                        alt="Profile Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            About Me Image
                        </label>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    name="aboutImage"
                                    value={profile.aboutImage || ''}
                                    onChange={handleChange}
                                    className="input-field flex-1"
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
                                        className={`px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap ${
                                            isUploadingAbout ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isUploadingAbout ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                            {(profile.aboutImage || profile.image) && (
                                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
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

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
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
                        <label className="block text-sm font-semibold mb-2">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Location</label>
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
                    <label className="block text-sm font-semibold mb-2">Resume / CV Link</label>
                    <input
                        type="url"
                        name="resumeUrl"
                        value={profile.resumeUrl}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., https://drive.google.com/..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Paste the public link to your CV (Google Drive, Dropbox, etc.)
                    </p>
                </div>

                <motion.button
                    type="submit"
                    className="btn-primary flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </motion.button>
            </motion.form>
        </div>
    );
};
