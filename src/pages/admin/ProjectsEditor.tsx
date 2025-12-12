import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Project } from '../../types/portfolio';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';
import { compressImage } from '../../utils/fileUtils';

export const ProjectsEditor: React.FC = () => {
    const { data, updateSection } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const [projects, setProjects] = useState(data.projects || []);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSave = async () => {
        try {
            await updateSection('projects', projects);
            showSuccess('Projects updated successfully! 🎉');
        } catch (error) {
            console.error('Error saving projects:', error);
            showError('Failed to save projects. Please try again.');
        }
    };

    const handleAdd = () => {
        const newProject: Project = {
            id: Date.now().toString(),
            title: 'New Project',
            description: 'Project description',
            longDescription: 'Detailed project description...',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
            technologies: [],
            featured: false,
            category: 'Web Development',
            date: new Date().toISOString().substring(0, 7),
        };
        // Don't add to list yet, just open modal
        setEditingProject(newProject);
    };

    const handleDelete = async (id: string) => {
        try {
            const newProjects = projects.filter((p) => p.id !== id);
            setProjects(newProjects);
            await updateSection('projects', newProjects);
            if (editingProject?.id === id) {
                setEditingProject(null);
            }
            showSuccess('Project deleted successfully!');
        } catch (error) {
            console.error('Error deleting project:', error);
            showError('Failed to delete project. Please try again.');
        }
    };

    const handleUpdate = async (updatedProject: Project) => {
        try {
            let newProjects;
            const exists = projects.some((p) => p.id === updatedProject.id);

            if (exists) {
                newProjects = projects.map((p) =>
                    p.id === updatedProject.id ? updatedProject : p
                );
            } else {
                newProjects = [...projects, updatedProject];
            }

            setProjects(newProjects);
            await updateSection('projects', newProjects);
            setEditingProject(null);
            showSuccess(exists ? 'Project updated successfully! 🎉' : 'Project added successfully! 🎉');
        } catch (error) {
            console.error('Error saving project:', error);
            showError('Failed to save project. Please try again.');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingProject) {
            try {
                setIsUploading(true);
                const base64 = await compressImage(file);
                setEditingProject({ ...editingProject, image: base64 });
                showSuccess('Image uploaded successfully!');
            } catch (error) {
                console.error('Failed to convert image:', error);
                showError('Failed to upload image. Please try a smaller file.');
            } finally {
                setIsUploading(false);
            }
        }
    };


    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold font-display mb-2">Manage Projects</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Showcase your work and achievements
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
                        Add Project
                    </motion.button>
                    <motion.button
                        onClick={handleSave}
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Save All
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <motion.div key={project.id} layout className="card">
                        <div className="flex items-start gap-4">
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-1">{project.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                    {project.description}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingProject(project)}
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingProject && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Edit Project</h2>
                            <button
                                onClick={() => setEditingProject(null)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editingProject.title}
                                    onChange={(e) =>
                                        setEditingProject({ ...editingProject, title: e.target.value })
                                    }
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Short Description
                                </label>
                                <textarea
                                    value={editingProject.description}
                                    onChange={(e) =>
                                        setEditingProject({
                                            ...editingProject,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={2}
                                    className="input-field resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Long Description
                                </label>
                                <textarea
                                    value={editingProject.longDescription}
                                    onChange={(e) =>
                                        setEditingProject({
                                            ...editingProject,
                                            longDescription: e.target.value,
                                        })
                                    }
                                    rows={4}
                                    className="input-field resize-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Project Image
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                value={editingProject.image}
                                                onChange={(e) =>
                                                    setEditingProject({ ...editingProject, image: e.target.value })
                                                }
                                                className="input-field flex-1"
                                                placeholder="Enter URL or upload image"
                                            />
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/gif"
                                                    onChange={handleImageUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    disabled={isUploading}
                                                />
                                                <button
                                                    className={`px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                >
                                                    {isUploading ? 'Uploading...' : 'Upload Image'}
                                                </button>
                                            </div>
                                        </div>
                                        {editingProject.image && (
                                            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                                                <img
                                                    src={editingProject.image}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProject.category}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                category: e.target.value,
                                            })
                                        }
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Technologies (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={editingProject.technologies.join(', ')}
                                    onChange={(e) =>
                                        setEditingProject({
                                            ...editingProject,
                                            technologies: e.target.value.split(',').map((t) => t.trim()),
                                        })
                                    }
                                    className="input-field"
                                    placeholder="React, TypeScript, Node.js"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Live URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={editingProject.liveUrl || ''}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                liveUrl: e.target.value,
                                            })
                                        }
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        GitHub URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={editingProject.githubUrl || ''}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                githubUrl: e.target.value,
                                            })
                                        }
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={editingProject.featured}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                featured: e.target.checked,
                                            })
                                        }
                                        className="w-5 h-5"
                                    />
                                    <span className="font-semibold">Featured Project</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => handleUpdate(editingProject)}
                                    className="btn-primary flex-1"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditingProject(null)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
