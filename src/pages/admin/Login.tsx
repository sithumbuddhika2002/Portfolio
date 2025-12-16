import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/auth';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const success = auth.login(formData.username, formData.password);
            if (success) {
                navigate('/admin/dashboard');
            } else {
                setError('Invalid username or password');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary-500 via-accent-500 to-primary-700">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full filter blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="glass-strong rounded-2xl p-8 shadow-2xl">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4"
                        >
                            <LockClosedIcon className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white font-display">
                            Admin Login
                        </h1>
                        <p className="text-white/80 mt-2">
                            Enter your credentials to access the dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-white font-semibold mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/60 focus:border-white focus:ring-2 focus:ring-white/30 outline-none transition-all"
                                placeholder="Enter username"
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/60 focus:border-white focus:ring-2 focus:ring-white/30 outline-none transition-all"
                                placeholder="Enter password"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg bg-white text-primary-600 font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </motion.button>
                    </form>



                    {/* Back to Portfolio */}
                    <motion.a
                        href="/"
                        className="block text-center mt-6 text-white/80 hover:text-white transition-colors"
                        whileHover={{ scale: 1.05 }}
                    >
                        ← Back to Portfolio
                    </motion.a>
                </div>
            </motion.div>
        </div>
    );
};
