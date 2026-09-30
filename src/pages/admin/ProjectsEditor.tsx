import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Project } from '../../types/portfolio';
import {
    PlusIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    UserIcon,
    AcademicCapIcon,
    BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';
import { uploadImageSmart } from '../../utils/fileUtils';
import {
    normalizeCategory,
    isProjectInFilter,
    getCategoryBadgeStyle,
    PROJECT_CATEGORIES,
} from '../../utils/projectUtils';

export const ProjectsEditor: React.FC = () => {
    const { data, updateSection } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const [projects, setProjects] = useState<Project[]>(data.projects || []);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [isSavingProject, setIsSavingProject] = useState(false);

    // Category filter and search
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Keep state synchronized with context data
    useEffect(() => {
        if (data.projects) {
            setProjects(data.projects);
        }
    }, [data.projects]);

    // Calculate category counts
    const counts = {
        all: projects.length,
        personal: projects.filter((p) => normalizeCategory(p.category) === 'Personal Projects').length,
        university: projects.filter((p) => normalizeCategory(p.category) === 'University Projects').length,
        corporate: projects.filter((p) => normalizeCategory(p.category) === 'Corporate Projects').length,
    };

    // Detect any other custom categories from existing projects
    const otherCategories = Array.from(
        new Set(
            projects
                .map((p) => p.category)
                .filter((cat) => {
                    const norm = normalizeCategory(cat);
                    return !PROJECT_CATEGORIES.includes(norm as any);
                })
        )
    );

    const handleSave = async () => {
        setIsSavingAll(true);
        try {
            await updateSection('projects', projects);
            showSuccess('Projects updated successfully! 🎉');
        } catch (error) {
            console.error('Error saving projects:', error);
            showError('Failed to save projects. Please try again.');
        } finally {
            setIsSavingAll(false);
        }
    };

    const handleAdd = () => {
        // Pre-select category based on active filter if specific, else default to Personal Projects
        const defaultCat =
            activeCategory !== 'all' && PROJECT_CATEGORIES.includes(activeCategory as any)
                ? activeCategory
                : 'Personal Projects';

        const newProject: Project = {
            id: Date.now().toString(),
            title: 'New Project',
            description: 'Project short description',
            longDescription: 'Detailed project description...',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
            technologies: [],
            featured: false,
            category: defaultCat,
            date: new Date().toISOString().substring(0, 7),
        };
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
        setIsSavingProject(true);
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
        } finally {
            setIsSavingProject(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingProject) {
            try {
                setIsUploading(true);
                const { url, source } = await uploadImageSmart(file, data.settings, { maxWidth: 1600, quality: 0.88 });
                setEditingProject({ ...editingProject, image: url });
                const badge = source === 'cloudinary' ? 'Cloudinary ☁️' : 'HD Crisp 🖼️';
                showSuccess(`Project image uploaded via ${badge}! 🎉`);
            } catch (error) {
                console.error('Failed to upload image:', error);
                showError('Failed to upload image. Please try again.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Filter projects according to category and search query
    const filteredProjects = projects.filter((p) => {
        const matchesCategory = isProjectInFilter(p.category, activeCategory);
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
            !q ||
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(q)));
        return matchesCategory && matchesSearch;
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
        }
        return (b.date || '').localeCompare(a.date || '');
    });

    return (
        <div className="w-full pb-12">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1.5">Manage Projects</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Categorized across Personal, University, and Corporate projects
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleAdd}
                        className="btn-secondary w-full sm:w-auto text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Project
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                        disabled={isSavingAll}
                    >
                        {isSavingAll ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save All'
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Category KPI Cards - Strictly website colors (primary, accent, gray) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                        activeCategory === 'all'
                            ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            All Projects
                        </span>
                        <div className="p-2 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                            <FolderIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{counts.all}</div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Total in portfolio</p>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveCategory('Personal Projects')}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                        activeCategory === 'Personal Projects'
                            ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                            Personal
                        </span>
                        <div className="p-2 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                            <UserIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{counts.personal}</div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Personal & side projects</p>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveCategory('University Projects')}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                        activeCategory === 'University Projects'
                            ? 'bg-gray-100 dark:bg-gray-700/60 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            University
                        </span>
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <AcademicCapIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{counts.university}</div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Academic & research work</p>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveCategory('Corporate Projects')}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                        activeCategory === 'Corporate Projects'
                            ? 'bg-accent-500/10 border-accent-500 text-accent-600 dark:text-accent-400'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                            Corporate
                        </span>
                        <div className="p-2 rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-400">
                            <BriefcaseIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{counts.corporate}</div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Client & enterprise work</p>
                </button>
            </div>

            {/* Filter Pills and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                            activeCategory === 'all'
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        All ({counts.all})
                    </button>
                    {PROJECT_CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat;
                        const catCount =
                            cat === 'Personal Projects'
                                ? counts.personal
                                : cat === 'University Projects'
                                ? counts.university
                                : counts.corporate;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                                    isActive
                                        ? 'bg-primary-600 text-white border-primary-600'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                {cat} ({catCount})
                            </button>
                        );
                    })}
                    {otherCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                                activeCategory === cat
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {cat} ({projects.filter((p) => p.category === cat).length})
                        </button>
                    ))}
                </div>

                <div className="relative min-w-[240px]">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects by title, tech..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Projects Grid */}
            {sortedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedProjects.map((project) => {
                        const badge = getCategoryBadgeStyle(project.category);
                        return (
                            <motion.div
                                key={project.id}
                                layout
                                className="card flex flex-col justify-between hover:border-primary-500/40 transition-colors"
                            >
                                <div>
                                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-3">
                                        <div className="relative w-full sm:w-28 sm:h-28 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {project.featured && (
                                                <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-accent-500 text-white font-semibold shadow-xs">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                                                    {project.title}
                                                </h3>
                                            </div>

                                            {/* Category Tag Box - No yellow */}
                                            <div className="mb-2">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                    {normalizeCategory(project.category)}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                                {project.description}
                                            </p>

                                            {project.technologies && project.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {project.technologies.slice(0, 3).map((tech, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.technologies.length > 3 && (
                                                        <span className="text-[10px] px-1 py-0.5 text-gray-400">
                                                            +{project.technologies.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {project.date && (
                                        <div className="text-[11px] text-gray-400 mb-2">
                                            Date: <span className="font-medium text-gray-600 dark:text-gray-300">{project.date}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-sm">
                                    <button
                                        onClick={() =>
                                            handleUpdate({ ...project, featured: !project.featured })
                                        }
                                        className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                            project.featured
                                                ? 'text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/30'
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {project.featured ? '★ Featured' : '☆ Make Featured'}
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setEditingProject(project)}
                                            className="px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <FolderIcon className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-60" />
                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        No projects found
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {searchQuery
                            ? `No projects matched "${searchQuery}"`
                            : `No projects in ${activeCategory === 'all' ? 'the portfolio' : activeCategory}`}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add New Project
                    </button>
                </div>
            )}

            {/* Edit / Add Modal */}
            <AnimatePresence>
                {editingProject && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {projects.some((p) => p.id === editingProject.id)
                                            ? 'Edit Project'
                                            : 'Add New Project'}
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Configure project details, category, and technologies
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEditingProject(null)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
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
                                        placeholder="Project title..."
                                    />
                                </div>

                                {/* Category Selection Section */}
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-700/80">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <label className="block text-sm font-semibold">
                                            Project Category
                                        </label>
                                        <span
                                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5 ${
                                                getCategoryBadgeStyle(editingProject.category).bg
                                            } ${getCategoryBadgeStyle(editingProject.category).text} ${
                                                getCategoryBadgeStyle(editingProject.category).border
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    getCategoryBadgeStyle(editingProject.category).dot
                                                }`}
                                            />
                                            {normalizeCategory(editingProject.category)}
                                        </span>
                                    </div>

                                    {/* Preset Category Buttons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                                        {PROJECT_CATEGORIES.map((cat) => {
                                            const isSelected =
                                                normalizeCategory(editingProject.category) === cat;
                                            return (
                                                <button
                                                    type="button"
                                                    key={cat}
                                                    onClick={() =>
                                                        setEditingProject({ ...editingProject, category: cat })
                                                    }
                                                    className={`px-3 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                                                        isSelected
                                                            ? 'bg-primary-600 text-white border-primary-600'
                                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {cat === 'Personal Projects' && <UserIcon className="w-3.5 h-3.5" />}
                                                    {cat === 'University Projects' && <AcademicCapIcon className="w-3.5 h-3.5" />}
                                                    {cat === 'Corporate Projects' && <BriefcaseIcon className="w-3.5 h-3.5" />}
                                                    <span>{cat}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                                            Or enter custom category name:
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
                                            className="input-field text-xs py-2"
                                            placeholder="e.g. Personal Projects, University Projects, Corporate Projects..."
                                        />
                                    </div>
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
                                        placeholder="Brief 1-2 sentence overview..."
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
                                        placeholder="Comprehensive breakdown of architecture, challenges solved, and features..."
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
                                                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/gif, image/webp"
                                                        onChange={handleImageUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        disabled={isUploading}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={`px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap cursor-pointer ${
                                                            isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    >
                                                        {isUploading ? 'Uploading...' : 'Upload Image'}
                                                    </button>
                                                </div>
                                            </div>
                                            {editingProject.image && (
                                                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                                    <img
                                                        src={editingProject.image}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Project Date (YYYY-MM)
                                            </label>
                                            <input
                                                type="month"
                                                value={editingProject.date || ''}
                                                onChange={(e) =>
                                                    setEditingProject({
                                                        ...editingProject,
                                                        date: e.target.value,
                                                    })
                                                }
                                                className="input-field"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={editingProject.featured}
                                                    onChange={(e) =>
                                                        setEditingProject({
                                                            ...editingProject,
                                                            featured: e.target.checked,
                                                        })
                                                    }
                                                    className="w-5 h-5 rounded-md accent-primary-600 cursor-pointer"
                                                />
                                                <div>
                                                    <span className="font-semibold text-sm block">Featured Project</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                                        Highlights this project at top of portfolio
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Technologies (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProject.technologies ? editingProject.technologies.join(', ') : ''}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                technologies: e.target.value
                                                    .split(',')
                                                    .map((t) => t.trim())
                                                    .filter(Boolean),
                                            })
                                        }
                                        className="input-field"
                                        placeholder="React, TypeScript, Node.js, Tailwind CSS"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Live Demo URL (optional)
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
                                            placeholder="https://example.com"
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
                                            placeholder="https://github.com/yourusername/project"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => handleUpdate(editingProject)}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2 cursor-pointer"
                                        disabled={isSavingProject}
                                    >
                                        {isSavingProject ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setEditingProject(null)}
                                        className="btn-secondary flex-1 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
