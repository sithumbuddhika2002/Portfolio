import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import type { Company } from '../../types/portfolio';
import { 
    PlusIcon, 
    TrashIcon, 
    PencilSquareIcon, 
    ArrowUpTrayIcon, 
    LinkIcon, 
    XMarkIcon,
    BuildingOffice2Icon,
    ArrowTopRightOnSquareIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';
import { uploadImageSmart } from '../../utils/fileUtils';

export const CompaniesEditor: React.FC = () => {
    const { data, updateSection } = usePortfolioData();
    const { showSuccess, showError } = useToast();
    const [companies, setCompanies] = useState<Company[]>(data.companies || []);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [logoInputTab, setLogoInputTab] = useState<'upload' | 'url'>('upload');

    // Keep state in sync if data changes from Firestore
    React.useEffect(() => {
        if (data.companies) {
            setCompanies(data.companies);
        }
    }, [data.companies]);

    const handleSaveAll = async (newCompanies?: Company[]) => {
        const listToSave = newCompanies || companies;
        setIsSaving(true);
        try {
            await updateSection('companies', listToSave);
            showSuccess('Companies updated successfully! 🎉');
        } catch (error) {
            console.error('Error saving companies:', error);
            showError('Failed to save companies. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenAdd = () => {
        setIsNew(true);
        setEditingCompany({
            id: Date.now().toString(),
            name: '',
            position: '',
            logo: '',
            period: 'Present',
            url: '',
            current: true,
            description: '',
        });
        setLogoInputTab('upload');
    };

    const handleOpenEdit = (comp: Company) => {
        setIsNew(false);
        setEditingCompany({ ...comp });
        setLogoInputTab(comp.logo?.startsWith('http') && !comp.logo.includes('cloudinary') ? 'url' : 'upload');
    };

    const handleDelete = async (id: string) => {
        const updated = companies.filter((c) => c.id !== id);
        setCompanies(updated);
        await handleSaveAll(updated);
        showSuccess('Company deleted.');
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= companies.length) return;
        const newArr = [...companies];
        const [moved] = newArr.splice(index, 1);
        newArr.splice(targetIndex, 0, moved);
        setCompanies(newArr);
        handleSaveAll(newArr);
    };

    const handleSaveModal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCompany) return;

        if (!editingCompany.name.trim()) {
            showError('Company name is required.');
            return;
        }
        if (!editingCompany.position.trim()) {
            showError('Position / role is required.');
            return;
        }

        let updatedList: Company[];
        if (isNew) {
            updatedList = [editingCompany, ...companies];
        } else {
            updatedList = companies.map((c) => (c.id === editingCompany.id ? editingCompany : c));
        }

        setCompanies(updatedList);
        setEditingCompany(null);
        await handleSaveAll(updatedList);
        showSuccess(isNew ? 'Company added successfully! 🎉' : 'Company updated successfully! 🎉');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingCompany) return;

        try {
            setIsUploading(true);
            const { url, source } = await uploadImageSmart(file, data.settings, { maxWidth: 600, quality: 0.9 });
            setEditingCompany({ ...editingCompany, logo: url });
            const badge = source === 'cloudinary' ? 'Cloudinary ☁️' : 'Local HD 🖼️';
            showSuccess(`Logo uploaded via ${badge}!`);
        } catch (err) {
            console.error('Failed to upload logo:', err);
            showError('Failed to upload logo. Please check file format or try a URL.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2 flex items-center gap-2.5">
                        <BuildingOffice2Icon className="w-8 h-8 text-primary-500 inline-block" />
                        Manage Companies & Workplaces
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your company logos, positions, and company names shown in the About section.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <motion.button
                        onClick={handleOpenAdd}
                        className="btn-secondary flex items-center justify-center gap-2 cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Company
                    </motion.button>
                    <motion.button
                        onClick={() => handleSaveAll()}
                        className="btn-primary flex items-center justify-center gap-2 cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckIcon className="w-5 h-5" />
                                Save All
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Companies List */}
            {companies.length === 0 ? (
                <div className="card text-center py-16 w-full">
                    <BuildingOffice2Icon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Companies Added Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                        Add the companies you have worked for or are currently working at to display them in the About section.
                    </p>
                    <button onClick={handleOpenAdd} className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                        <PlusIcon className="w-5 h-5" />
                        Add Your First Company
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {companies.map((company, index) => (
                        <motion.div
                            key={company.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card flex flex-col justify-between group border border-gray-200/80 dark:border-gray-800/80 hover:border-primary-500/40 transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                {/* Logo thumbnail container */}
                                <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center p-2 flex-shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                                    {company.logo ? (
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                // Fallback on broken image
                                                (e.target as HTMLElement).style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('bg-primary-500/10');
                                            }}
                                        />
                                    ) : (
                                        <div className="text-xl font-bold text-primary-600 dark:text-primary-400 font-display">
                                            {company.name ? company.name.substring(0, 2).toUpperCase() : <BuildingOffice2Icon className="w-7 h-7 text-gray-400" />}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                                            {company.name}
                                        </h3>
                                        {company.current && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Current
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1">
                                        {company.position}
                                    </p>

                                    {company.period && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            {company.period}
                                        </p>
                                    )}

                                    {company.url && (
                                        <a
                                            href={company.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[200px]">{company.url.replace(/^https?:\/\//, '')}</span>
                                            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        title="Move Up"
                                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <ArrowUpIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === companies.length - 1}
                                        title="Move Down"
                                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <ArrowDownIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenEdit(company)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(company.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {editingCompany && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 my-auto"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold font-display flex items-center gap-2">
                                    <BuildingOffice2Icon className="w-6 h-6 text-primary-500" />
                                    {isNew ? 'Add Company' : 'Edit Company'}
                                </h2>
                                <button
                                    onClick={() => setEditingCompany(null)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveModal} className="space-y-5">
                                {/* Company Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingCompany.name}
                                        onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                                        placeholder="e.g. Foresight Engineering"
                                        className="input-field"
                                    />
                                </div>

                                {/* Position / Role */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Your Position / Role <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingCompany.position}
                                        onChange={(e) => setEditingCompany({ ...editingCompany, position: e.target.value })}
                                        placeholder="e.g. Associate Software Engineer"
                                        className="input-field"
                                    />
                                </div>

                                {/* Period and Currently Working Here */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Period / Years
                                        </label>
                                        <input
                                            type="text"
                                            value={editingCompany.period || ''}
                                            onChange={(e) => setEditingCompany({ ...editingCompany, period: e.target.value })}
                                            placeholder="e.g. 2023 - Present"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Website / URL
                                        </label>
                                        <input
                                            type="url"
                                            value={editingCompany.url || ''}
                                            onChange={(e) => setEditingCompany({ ...editingCompany, url: e.target.value })}
                                            placeholder="https://company.com"
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                {/* Active toggle */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
                                    <input
                                        type="checkbox"
                                        id="current-company-toggle"
                                        checked={editingCompany.current || false}
                                        onChange={(e) => setEditingCompany({ ...editingCompany, current: e.target.checked })}
                                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                                    />
                                    <label htmlFor="current-company-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                        I currently work here (shows "Current" badge)
                                    </label>
                                </div>

                                {/* Company Logo Section (Device or URL Paste) */}
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            Company Logo
                                        </label>
                                        {/* Switch tabs: Device vs URL */}
                                        <div className="inline-flex rounded-lg bg-gray-200 dark:bg-gray-700 p-0.5 text-xs font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => setLogoInputTab('upload')}
                                                className={`px-2.5 py-1 rounded-md transition-all ${
                                                    logoInputTab === 'upload'
                                                        ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                From Device
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setLogoInputTab('url')}
                                                className={`px-2.5 py-1 rounded-md transition-all ${
                                                    logoInputTab === 'url'
                                                        ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                Paste URL
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upload from Device Option */}
                                    {logoInputTab === 'upload' ? (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="logo-device-upload"
                                                    accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                    className="sr-only"
                                                />
                                                <label
                                                    htmlFor="logo-device-upload"
                                                    className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 cursor-pointer transition-colors text-sm font-medium ${
                                                        isUploading ? 'opacity-60 pointer-events-none' : ''
                                                    }`}
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                                                            <span>Uploading logo...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowUpTrayIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                            <span>Click to select logo from device</span>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
                                                Supports PNG, SVG, JPG, WebP. Transparent backgrounds look best!
                                            </p>
                                        </div>
                                    ) : (
                                        /* Paste URL Option */
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <input
                                                    type="url"
                                                    value={editingCompany.logo || ''}
                                                    onChange={(e) => setEditingCompany({ ...editingCompany, logo: e.target.value })}
                                                    placeholder="Paste logo image URL (e.g. https://.../logo.png)"
                                                    className="input-field pr-10"
                                                />
                                                <LinkIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                Direct link to company logo image file on web.
                                            </p>
                                        </div>
                                    )}

                                    {/* Logo Live Preview */}
                                    {editingCompany.logo ? (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1.5 flex items-center justify-center overflow-hidden shadow-sm">
                                                    <img
                                                        src={editingCompany.logo}
                                                        alt="Logo preview"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                        Logo Preview
                                                    </p>
                                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                        <CheckIcon className="w-3.5 h-3.5" /> Logo loaded
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditingCompany({ ...editingCompany, logo: '' })}
                                                className="px-2.5 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                            >
                                                Remove Logo
                                            </button>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCompany(null)}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="btn-primary"
                                    >
                                        {isNew ? 'Add Company' : 'Save Changes'}
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
