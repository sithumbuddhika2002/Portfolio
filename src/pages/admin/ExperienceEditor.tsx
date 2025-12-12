import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Experience, Education } from '../../types/portfolio';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';

export const ExperienceEditor: React.FC = () => {
    const { data, updateSection } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const [experience, setExperience] = useState(data.experience || []);
    const [education, setEducation] = useState(data.education || []);

    const handleSave = async () => {
        try {
            await updateSection('experience', experience);
            await updateSection('education', education);
            showSuccess('Experience and education updated successfully! 🎉');
        } catch (error) {
            console.error('Error saving experience/education:', error);
            showError('Failed to save changes. Please try again.');
        }
    };


    const handleAddWork = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            company: 'Company Name',
            position: 'Position Title',
            description: 'Description of responsibilities...',
            startDate: new Date().toISOString().substring(0, 7),
            endDate: 'Present',
            location: 'Location',
            type: 'work',
        };
        setExperience([...experience, newExp]);
    };

    const handleAddEducation = () => {
        const newEdu: Education = {
            id: Date.now().toString(),
            institution: 'Institution Name',
            degree: 'Degree',
            field: 'Field of Study',
            startDate: new Date().toISOString().substring(0, 7),
            endDate: 'Present',
            location: 'Location',
            type: 'education',
        };
        setEducation([...education, newEdu]);
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold font-display mb-2">
                        Manage Experience
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update your work and education history
                    </p>
                </div>
                <motion.button
                    onClick={handleSave}
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Save All
                </motion.button>
            </motion.div>

            {/* Work Experience */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Work Experience</h2>
                    <button onClick={handleAddWork} className="btn-secondary">
                        <PlusIcon className="w-5 h-5 inline mr-2" />
                        Add Work
                    </button>
                </div>

                <div className="space-y-6">
                    {experience.map((exp, index) => (
                        <motion.div key={exp.id} layout className="card">
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Position
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.position}
                                        onChange={(e) => {
                                            const newExp = [...experience];
                                            newExp[index] = { ...exp, position: e.target.value };
                                            setExperience(newExp);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => {
                                            const newExp = [...experience];
                                            newExp[index] = { ...exp, company: e.target.value };
                                            setExperience(newExp);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={exp.description}
                                    onChange={(e) => {
                                        const newExp = [...experience];
                                        newExp[index] = { ...exp, description: e.target.value };
                                        setExperience(newExp);
                                    }}
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="month"
                                        value={exp.startDate}
                                        onChange={(e) => {
                                            const newExp = [...experience];
                                            newExp[index] = { ...exp, startDate: e.target.value };
                                            setExperience(newExp);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="month"
                                        value={exp.endDate === 'Present' ? '' : exp.endDate}
                                        onChange={(e) => {
                                            const newExp = [...experience];
                                            newExp[index] = {
                                                ...exp,
                                                endDate: e.target.value || 'Present',
                                            };
                                            setExperience(newExp);
                                        }}
                                        className="input-field"
                                        placeholder="Present"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.location}
                                        onChange={(e) => {
                                            const newExp = [...experience];
                                            newExp[index] = { ...exp, location: e.target.value };
                                            setExperience(newExp);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    setExperience(experience.filter((_, i) => i !== index))
                                }
                                className="mt-4 text-red-600 hover:text-red-700 flex items-center gap-2"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Delete
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Education</h2>
                    <button onClick={handleAddEducation} className="btn-secondary">
                        <PlusIcon className="w-5 h-5 inline mr-2" />
                        Add Education
                    </button>
                </div>

                <div className="space-y-6">
                    {education.map((edu, index) => (
                        <motion.div key={edu.id} layout className="card">
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Degree</label>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => {
                                            const newEdu = [...education];
                                            newEdu[index] = { ...edu, degree: e.target.value };
                                            setEducation(newEdu);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Field of Study
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.field}
                                        onChange={(e) => {
                                            const newEdu = [...education];
                                            newEdu[index] = { ...edu, field: e.target.value };
                                            setEducation(newEdu);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Institution
                                </label>
                                <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => {
                                        const newEdu = [...education];
                                        newEdu[index] = { ...edu, institution: e.target.value };
                                        setEducation(newEdu);
                                    }}
                                    className="input-field"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="month"
                                        value={edu.startDate}
                                        onChange={(e) => {
                                            const newEdu = [...education];
                                            newEdu[index] = { ...edu, startDate: e.target.value };
                                            setEducation(newEdu);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="month"
                                        value={edu.endDate === 'Present' ? '' : edu.endDate}
                                        onChange={(e) => {
                                            const newEdu = [...education];
                                            newEdu[index] = {
                                                ...edu,
                                                endDate: e.target.value || 'Present',
                                            };
                                            setEducation(newEdu);
                                        }}
                                        className="input-field"
                                        placeholder="Present"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.location}
                                        onChange={(e) => {
                                            const newEdu = [...education];
                                            newEdu[index] = { ...edu, location: e.target.value };
                                            setEducation(newEdu);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    setEducation(education.filter((_, i) => i !== index))
                                }
                                className="mt-4 text-red-600 hover:text-red-700 flex items-center gap-2"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Delete
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
