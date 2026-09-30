import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Experience, Education } from '../../types/portfolio';
import { PlusIcon, TrashIcon, BuildingOffice2Icon, ArrowUpTrayIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';
import { uploadImageSmart } from '../../utils/fileUtils';

export const ExperienceEditor: React.FC = () => {
    const { data, updateSection } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const [experience, setExperience] = useState(data.experience || []);
    const [education, setEducation] = useState(data.education || []);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingExpId, setUploadingExpId] = useState<string | null>(null);
    const [uploadingEduId, setUploadingEduId] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSection('experience', experience);
            await updateSection('education', education);
            showSuccess('Experience and education updated successfully! 🎉');
        } catch (error) {
            console.error('Error saving experience/education:', error);
            showError('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
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
            skills: [],
            achievements: [],
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
            skills: [],
            achievements: [],
            logo: '',
        };
        setEducation([...education, newEdu]);
    };

    return (
        <div className="w-full pb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">
                        Manage Experience
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update your work and education history
                    </p>
                </div>
                <motion.button
                    onClick={handleSave}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save All'
                    )}
                </motion.button>
            </motion.div>

            {/* Work Experience */}
            <div className="mb-12 w-full">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Work Experience</h2>
                    <button onClick={handleAddWork} className="btn-secondary w-full sm:w-auto text-center cursor-pointer">
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

                            {/* Company Logo input (device or url) */}
                            <div className="mb-4 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                    Company Logo
                                </label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    {/* Preview */}
                                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                                        {exp.logo ? (
                                            <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain" />
                                        ) : (
                                            <BuildingOffice2Icon className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>

                                    {/* URL input & Upload */}
                                    <div className="flex-1 w-full flex items-center gap-2">
                                        <input
                                            type="url"
                                            value={exp.logo || ''}
                                            onChange={(e) => {
                                                const newExp = [...experience];
                                                newExp[index] = { ...exp, logo: e.target.value };
                                                setExperience(newExp);
                                            }}
                                            placeholder="Paste logo URL (or upload from device)"
                                            className="input-field text-sm flex-1"
                                        />

                                        {/* Upload from device button */}
                                        <div className="relative shrink-0">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id={`exp-logo-upload-${exp.id}`}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        try {
                                                            setUploadingExpId(exp.id);
                                                            const { url } = await uploadImageSmart(file, data.settings, { maxWidth: 600, quality: 0.9 });
                                                            const newExp = [...experience];
                                                            newExp[index] = { ...exp, logo: url };
                                                            setExperience(newExp);
                                                            showSuccess('Logo uploaded!');
                                                        } catch (err) {
                                                            showError('Failed to upload logo');
                                                        } finally {
                                                            setUploadingExpId(null);
                                                        }
                                                    }
                                                }}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor={`exp-logo-upload-${exp.id}`}
                                                className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap"
                                            >
                                                {uploadingExpId === exp.id ? (
                                                    <span>Uploading...</span>
                                                ) : (
                                                    <>
                                                        <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                                                        <span>Upload</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        {exp.logo && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newExp = [...experience];
                                                    newExp[index] = { ...exp, logo: '' };
                                                    setExperience(newExp);
                                                }}
                                                className="text-xs text-red-500 hover:underline whitespace-nowrap px-1"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
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

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Skills Used (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.skills ? exp.skills.join(', ') : ''}
                                        onChange={(e) => {
                                            const newExp = [...experience];
                                            newExp[index] = { 
                                                ...exp, 
                                                skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                                            };
                                            setExperience(newExp);
                                        }}
                                        placeholder="e.g. React, TypeScript, Node.js"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Key Achievements (one per line)
                                    </label>
                                    <textarea
                                        value={exp.achievements ? exp.achievements.join('\n') : ''}
                                        onChange={(e) => {
                                            const newExp = [...experience];
                                            newExp[index] = { 
                                                ...exp, 
                                                achievements: e.target.value.split('\n').map(a => a.trim()).filter(Boolean) 
                                            };
                                            setExperience(newExp);
                                        }}
                                        placeholder="e.g. Led development of X...&#10;Improved API performance by 40%..."
                                        rows={3}
                                        className="input-field resize-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Education</h2>
                    <button onClick={handleAddEducation} className="btn-secondary w-full sm:w-auto text-center">
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

                            {/* Institution Logo input (device or url) */}
                            <div className="mb-4 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                    Institution Logo
                                </label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    {/* Preview */}
                                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                                        {edu.logo ? (
                                            <img src={edu.logo} alt={edu.institution} className="w-full h-full object-contain" />
                                        ) : (
                                            <AcademicCapIcon className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>

                                    {/* URL input & Upload */}
                                    <div className="flex-1 w-full flex items-center gap-2">
                                        <input
                                            type="url"
                                            value={edu.logo || ''}
                                            onChange={(e) => {
                                                const newEdu = [...education];
                                                newEdu[index] = { ...edu, logo: e.target.value };
                                                setEducation(newEdu);
                                            }}
                                            placeholder="Paste logo URL (or upload from device)"
                                            className="input-field text-sm flex-1"
                                        />

                                        {/* Upload from device button */}
                                        <div className="relative shrink-0">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id={`edu-logo-upload-${edu.id}`}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        try {
                                                            setUploadingEduId(edu.id);
                                                            const { url } = await uploadImageSmart(file, data.settings, { maxWidth: 600, quality: 0.9 });
                                                            const newEdu = [...education];
                                                            newEdu[index] = { ...edu, logo: url };
                                                            setEducation(newEdu);
                                                            showSuccess('Logo uploaded!');
                                                        } catch (err) {
                                                            showError('Failed to upload logo');
                                                        } finally {
                                                            setUploadingEduId(null);
                                                        }
                                                    }
                                                }}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor={`edu-logo-upload-${edu.id}`}
                                                className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap"
                                            >
                                                {uploadingEduId === edu.id ? (
                                                    <span>Uploading...</span>
                                                ) : (
                                                    <>
                                                        <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                                                        <span>Upload</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        {edu.logo && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newEdu = [...education];
                                                    newEdu[index] = { ...edu, logo: '' };
                                                    setEducation(newEdu);
                                                }}
                                                className="text-xs text-red-500 hover:underline whitespace-nowrap px-1"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Skills Acquired (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.skills ? edu.skills.join(', ') : ''}
                                        onChange={(e) => {
                                            const newEdu = [...education];
                                            newEdu[index] = { 
                                                ...edu, 
                                                skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                                            };
                                            setEducation(newEdu);
                                        }}
                                        placeholder="e.g. Python, Data Structures, Algorithms"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Key Achievements / Coursework (one per line)
                                    </label>
                                    <textarea
                                        value={edu.achievements ? edu.achievements.join('\n') : ''}
                                        onChange={(e) => {
                                            const newEdu = [...education];
                                            newEdu[index] = { 
                                                ...edu, 
                                                achievements: e.target.value.split('\n').map(a => a.trim()).filter(Boolean) 
                                            };
                                            setEducation(newEdu);
                                        }}
                                        placeholder="e.g. Graduated Magna Cum Laude...&#10;TA for Intro to Computer Science..."
                                        rows={3}
                                        className="input-field resize-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
