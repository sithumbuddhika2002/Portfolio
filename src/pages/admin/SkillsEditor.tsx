import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Skill } from '../../types/portfolio';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export const SkillsEditor: React.FC = () => {
    const { data, updateSection } = usePortfolioData();
    const [skills, setSkills] = useState(data.skills);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        updateSection('skills', skills);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAdd = () => {
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: 'New Skill',
            category: 'frontend',
            proficiency: 50,
        };
        setSkills([...skills, newSkill]);
        setEditingSkill(newSkill);
    };

    const handleDelete = (id: string) => {
        setSkills(skills.filter((s) => s.id !== id));
    };

    const handleUpdate = (updatedSkill: Skill) => {
        setSkills(skills.map((s) => (s.id === updatedSkill.id ? updatedSkill : s)));
        setEditingSkill(null);
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold font-display mb-2">Manage Skills</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add, edit, or remove your skills
                    </p>
                </div>
                <div className="space-x-3">
                    <motion.button
                        onClick={handleAdd}
                        className="btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <PlusIcon className="w-5 h-5 inline mr-2" />
                        Add Skill
                    </motion.button>
                    <motion.button
                        onClick={handleSave}
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {saved ? '✓ Saved!' : 'Save All'}
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
                        {editingSkill?.id === skill.id ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={editingSkill.name}
                                    onChange={(e) =>
                                        setEditingSkill({ ...editingSkill, name: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="Skill name"
                                />
                                <select
                                    value={editingSkill.category}
                                    onChange={(e) =>
                                        setEditingSkill({
                                            ...editingSkill,
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

                                <div>
                                    <label className="block text-sm mb-2 text-gray-600 dark:text-gray-400">
                                        Custom Icon (SVG Code or URL)
                                    </label>
                                    <textarea
                                        value={editingSkill.icon || ''}
                                        onChange={(e) =>
                                            setEditingSkill({ ...editingSkill, icon: e.target.value })
                                        }
                                        className="input-field min-h-[100px] font-mono text-xs"
                                        placeholder="<svg>...</svg> or https://example.com/icon.png"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave empty to use default icon
                                    </p>

                                    <div className="mt-2">
                                        <label className="block text-xs text-gray-500 mb-1">Or upload an image (PNG, JPG, SVG)</label>
                                        <input
                                            type="file"
                                            accept=".svg, .png, .jpg, .jpeg"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setEditingSkill({
                                                            ...editingSkill,
                                                            icon: reader.result as string
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm mb-2">
                                        Proficiency: {editingSkill.proficiency}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={editingSkill.proficiency}
                                        onChange={(e) =>
                                            setEditingSkill({
                                                ...editingSkill,
                                                proficiency: parseInt(e.target.value),
                                            })
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdate(editingSkill)}
                                        className="btn-primary flex-1"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingSkill(null)}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingSkill(skill)}
                                            className="text-primary-600 hover:text-primary-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(skill.id)}
                                            className="text-red-600 hover:text-red-700"
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
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
