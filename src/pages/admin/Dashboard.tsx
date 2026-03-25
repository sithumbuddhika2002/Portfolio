import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../../services/auth';
import {
    UserIcon,
    WrenchScrewdriverIcon,
    BriefcaseIcon,
    FolderIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    HomeIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Profile', path: '/admin/dashboard/profile', icon: UserIcon },
    { name: 'Skills', path: '/admin/dashboard/skills', icon: WrenchScrewdriverIcon },
    { name: 'Projects', path: '/admin/dashboard/projects', icon: FolderIcon },
    { name: 'Experience', path: '/admin/dashboard/experience', icon: BriefcaseIcon },
    { name: 'Settings', path: '/admin/dashboard/settings', icon: Cog6ToothIcon },
];

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!auth.isAuthenticated()) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        auth.logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white dark:bg-gray-900 shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold font-display gradient-text">
                        Admin Panel
                    </h1>
                </div>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                className={`
                    fixed md:sticky top-0 left-0 h-screen w-64 z-40
                    bg-white dark:bg-gray-900 shadow-lg md:shadow-none border-r border-gray-200 dark:border-gray-800
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold font-display gradient-text hidden md:block">
                            Admin Panel
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Portfolio Manager
                        </p>
                    </div>
                    {/* Close button for mobile inside sidebar */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                    <nav className="px-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            <HomeIcon className="w-5 h-5" />
                            <span className="font-medium">View Portfolio</span>
                        </a>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </motion.aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full max-w-full">
                    <Outlet />
                </main>
            {/* End wrapper */}
        </div>
    );
};
