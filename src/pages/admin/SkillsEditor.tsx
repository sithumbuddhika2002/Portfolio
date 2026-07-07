import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Skill } from '../../types/portfolio';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';

export const SkillsEditor: React.FC = () => {
    const { data, updateSection } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const [skills, setSkills] = useState(data.skills || []);
    const [isSaving, setIsSaving] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [modalSkill, setModalSkill] = useState<Skill>({
        id: '',
        name: '',
        category: 'frontend',
        proficiency: 50,
        icon: '',
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSection('skills', skills);
            showSuccess('Skills updated successfully! 🎉');
        } catch (error) {
            console.error('Error saving skills:', error);
            showError('Failed to save skills. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddClick = () => {
        setModalMode('add');
        setModalSkill({
            id: Date.now().toString(),
            name: '',
            category: 'frontend',
            proficiency: 50,
            icon: '',
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (skill: Skill) => {
        setModalMode('edit');
        setModalSkill({ ...skill });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setSkills(skills.filter((s) => s.id !== id));
        showSuccess('Skill removed locally. Save All to persist changes! 💾');
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!modalSkill.name.trim()) {
            showError('Skill name is required');
            return;
        }

        if (modalMode === 'add') {
            setSkills([...skills, modalSkill]);
            showSuccess(`"${modalSkill.name}" added locally. Save All to persist changes! 💾`);
        } else {
            setSkills(skills.map((s) => (s.id === modalSkill.id ? modalSkill : s)));
            showSuccess(`"${modalSkill.name}" updated locally. Save All to persist changes! 💾`);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Manage Skills</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add, edit, or remove your skills
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <motion.button
                        onClick={handleAddClick}
                        className="btn-secondary w-full sm:w-auto text-center cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <PlusIcon className="w-5 h-5 inline mr-2" />
                        Add Skill
                    </motion.button>
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
                </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill) => (
                    <motion.div
                        key={skill.id}
                        layout
                        className="card-hover"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {skill.icon ? (
                                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center p-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                            {skill.icon.trim().startsWith('<svg') ? (
                                                <div
                                                    dangerouslySetInnerHTML={{ __html: skill.icon }}
                                                    className="w-full h-full text-primary-500 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                                                />
                                            ) : (
                                                <img
                                                    src={skill.icon}
                                                    alt={skill.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            )}
                                        </div>
                                    ) : null}
                                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleEditClick(skill)}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(skill.id)}
                                        className="text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                                        title="Delete Skill"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 capitalize">
                                {skill.category}
                            </p>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                                    style={{ width: `${skill.proficiency}%` }}
                                />
                            </div>
                            <p className="text-right text-sm mt-1">{skill.proficiency}%</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal Popup */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold font-display">
                                    {modalMode === 'add' ? 'Add New Skill' : 'Edit Skill'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleModalSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Skill Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={modalSkill.name}
                                        onChange={(e) =>
                                            setModalSkill({ ...modalSkill, name: e.target.value })
                                        }
                                        className="input-field animate-none"
                                        placeholder="e.g. React, Python, Docker"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Category
                                    </label>
                                    <select
                                        value={modalSkill.category}
                                        onChange={(e) =>
                                            setModalSkill({
                                                ...modalSkill,
                                                category: e.target.value as Skill['category'],
                                            })
                                        }
                                        className="input-field"
                                    >
                                        <option value="frontend">Frontend</option>
                                        <option value="backend">Backend</option>
                                        <option value="tools">Tools</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Custom Icon (SVG Code or Image URL)
                                        </label>
                                        {modalSkill.icon && (
                                            <span className="text-xs text-green-500 font-medium">✓ Icon set</span>
                                        )}
                                    </div>
                                    <div className="flex gap-4 items-start mb-3">
                                        <div className="flex-1">
                                            <textarea
                                                value={modalSkill.icon || ''}
                                                onChange={(e) =>
                                                    setModalSkill({ ...modalSkill, icon: e.target.value })
                                                }
                                                className="input-field min-h-[80px] font-mono text-xs"
                                                placeholder="<svg>...</svg> or https://example.com/icon.png"
                                            />
                                        </div>
                                        {modalSkill.icon && (
                                            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-700/50 p-2 border border-gray-200 dark:border-gray-600">
                                                {modalSkill.icon.trim().startsWith('<svg') ? (
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: modalSkill.icon }}
                                                        className="w-full h-full text-primary-500 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                                                    />
                                                ) : (
                                                    <img
                                                        src={modalSkill.icon}
                                                        alt="Icon preview"
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                            Or Upload Image / SVG File
                                        </label>
                                        <input
                                            type="file"
                                            accept=".svg, .png, .jpg, .jpeg"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setModalSkill({
                                                            ...modalSkill,
                                                            icon: reader.result as string,
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Proficiency
                                        </label>
                                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full">
                                            {modalSkill.proficiency}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={modalSkill.proficiency}
                                        onChange={(e) =>
                                            setModalSkill({
                                                ...modalSkill,
                                                proficiency: parseInt(e.target.value),
                                            })
                                        }
                                        className="w-full accent-primary-500 cursor-pointer"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn-secondary flex-1 py-2.5 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex-1 py-2.5 cursor-pointer"
                                    >
                                        {modalMode === 'add' ? 'Add Skill' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

