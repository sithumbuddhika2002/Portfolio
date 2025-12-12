import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useToast } from '../../contexts/ToastContext';

export const ProfileEditor: React.FC = () => {
    const { data, updateSection, loading } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const [profile, setProfile] = useState(data.profile || {
        name: '',
        title: '',
        bio: '',
        image: '',
        email: '',
        phone: '',
        location: '',
        resumeUrl: ''
    });

    // Update local state when data loads
    useEffect(() => {
        if (data.profile) {
            setProfile(data.profile);
        }
    }, [data.profile]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateSection('profile', profile);
            showSuccess('Profile updated successfully! 🎉');
        } catch (error) {
            console.error('Error saving profile:', error);
            showError('Failed to save changes. Please check your Firebase configuration.');
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
                <h1 className="text-3xl font-bold font-display mb-2">Edit Profile</h1>
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
                    <label className="block text-sm font-semibold mb-2">Bio</label>
                    <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        rows={4}
                        className="input-field resize-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">
                        Profile Image URL
                    </label>
                    <input
                        type="url"
                        name="image"
                        value={profile.image}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
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
                    <label className="block text-sm font-semibold mb-2">Resume / CV</label>
                    <div className="space-y-3">
                        {profile.resumeUrl && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {profile.resumeUrl.startsWith('data:')
                                            ? 'Uploaded Resume'
                                            : 'Resume URL'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setProfile({ ...profile, resumeUrl: '' })}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                    Clear
                                </button>
                            </div>
                        )}

                        <div>
                            <label className="block w-full">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // Validate file size (5MB max)
                                            if (file.size > 5 * 1024 * 1024) {
                                                alert('File size must be less than 5MB');
                                                e.target.value = '';
                                                return;
                                            }

                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setProfile({
                                                    ...profile,
                                                    resumeUrl: reader.result as string
                                                });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-700 dark:file:text-gray-200 cursor-pointer"
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                Upload PDF, DOC, or DOCX (max 5MB)
                            </p>
                        </div>
                    </div>
                </div>

                <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Save Changes
                </motion.button>
            </motion.form>
        </div>
    );
};
