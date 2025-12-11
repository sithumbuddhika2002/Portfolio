import React, { useEffect } from 'react';
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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
            <div className="flex">
                {/* Sidebar */}
                <motion.aside
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    className="w-64 bg-white dark:bg-gray-900 h-screen sticky top-0 shadow-lg"
                >
                    <div className="p-6">
                        <h1 className="text-2xl font-bold font-display gradient-text">
                            Admin Panel
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Portfolio Manager
                        </p>
                    </div>

                    <nav className="px-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`
                                }
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
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
