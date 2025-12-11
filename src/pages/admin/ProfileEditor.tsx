import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';

export const ProfileEditor: React.FC = () => {
    const { data, updateSection } = usePortfolioData();
    const [profile, setProfile] = useState(data.profile);
    const [saved, setSaved] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSection('profile', profile);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

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

                <div className="grid md:grid-cols-2 gap-6">
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
                        <label className="block text-sm font-semibold mb-2">Resume URL</label>
                        <input
                            type="url"
                            name="resumeUrl"
                            value={profile.resumeUrl}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                </div>

                <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {saved ? '✓ Saved!' : 'Save Changes'}
                </motion.button>
            </motion.form>
        </div>
    );
};
