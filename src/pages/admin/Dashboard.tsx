import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../services/auth';
import {
    UserIcon,
    WrenchScrewdriverIcon,
    BriefcaseIcon,
    FolderIcon,
    BuildingOffice2Icon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    HomeIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Profile', path: '/admin/dashboard/profile', icon: UserIcon },
    { name: 'Companies', path: '/admin/dashboard/companies', icon: BuildingOffice2Icon },
    { name: 'Skills', path: '/admin/dashboard/skills', icon: WrenchScrewdriverIcon },
    { name: 'Projects', path: '/admin/dashboard/projects', icon: FolderIcon },
    { name: 'Experience', path: '/admin/dashboard/experience', icon: BriefcaseIcon },
    { name: 'Settings', path: '/admin/dashboard/settings', icon: Cog6ToothIcon },
];

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!auth.isAuthenticated()) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        auth.logout();
        navigate('/admin/login');
    };

    const currentTabName = navItems.find((item) => location.pathname.startsWith(item.path))?.name || 'Dashboard';

    return (
        <div className="h-screen h-[100dvh] bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row overflow-hidden w-full">
            {/* Mobile Header (Fixed at top of screen on mobile) */}
            <header className="md:hidden flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between z-20 shadow-xs">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold font-display gradient-text">
                        Admin Panel
                    </h1>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium border border-primary-500/20">
                        {currentTabName}
                    </span>
                </div>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -mr-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    aria-label="Open sidebar menu"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </header>

            {/* Mobile Sidebar Overlay & Drawer */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full flex flex-col justify-between bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden border-r border-gray-200 dark:border-gray-800"
                        >
                            {/* Mobile Drawer Header */}
                            <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h1 className="text-xl font-bold font-display gradient-text">
                                        Admin Panel
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Portfolio Manager
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                                    aria-label="Close sidebar menu"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Mobile Navigation List */}
                            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md font-semibold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 font-medium'
                                            }`
                                        }
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            {/* Mobile Drawer Footer */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1.5 bg-gray-50/50 dark:bg-gray-900/50">
                                <a
                                    href="/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium"
                                >
                                    <HomeIcon className="w-5 h-5 text-gray-500" />
                                    <span>View Portfolio</span>
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-sm font-medium cursor-pointer"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Fixed Sidebar (Never scrolls when main details section scrolls) */}
            <aside className="hidden md:flex flex-col w-64 h-full flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 select-none">
                {/* Brand Header */}
                <div className="p-6 pb-5 flex-shrink-0 border-b border-gray-100 dark:border-gray-800/70">
                    <h1 className="text-2xl font-bold font-display gradient-text">
                        Admin Panel
                    </h1>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                        Portfolio Manager
                    </p>
                </div>

                {/* Nav Links (Scrollable if height is constrained) */}
                <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    isActive
                                        ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md font-semibold'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Desktop Sidebar Footer */}
                <div className="flex-shrink-0 p-3.5 border-t border-gray-100 dark:border-gray-800 space-y-1 bg-gray-50/60 dark:bg-gray-900/60">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium"
                    >
                        <HomeIcon className="w-5 h-5 text-gray-500" />
                        <span>View Portfolio</span>
                    </a>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-sm font-medium cursor-pointer"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content (Occupies 100% remaining width and scrolls independently) */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10 w-full min-w-0 bg-gray-100 dark:bg-gray-950">
                <div className="w-full max-w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
