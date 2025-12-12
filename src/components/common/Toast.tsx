import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type,
    duration = 3000,
    onClose
}) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                onClose(id);
            }
        }, 10);

        return () => clearInterval(interval);
    }, [id, duration, onClose]);

    const icons = {
        success: CheckCircleIcon,
        error: XCircleIcon,
    };

    const colors = {
        success: {
            bg: 'bg-green-500/90',
            icon: 'text-green-100',
            progress: 'bg-green-300',
        },
        error: {
            bg: 'bg-red-500/90',
            icon: 'text-red-100',
            progress: 'bg-red-300',
        },
    };

    const Icon = icons[type];
    const color = colors[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`${color.bg} backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden min-w-[320px] max-w-md`}
        >
            <div className="p-4 flex items-start gap-3">
                <Icon className={`w-6 h-6 ${color.icon} flex-shrink-0 mt-0.5`} />
                <p className="text-white font-medium flex-1 text-sm leading-relaxed">
                    {message}
                </p>
                <button
                    onClick={() => onClose(id)}
                    className="text-white/80 hover:text-white transition-colors flex-shrink-0"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="h-1 bg-white/20">
                <motion.div
                    className={`h-full ${color.progress}`}
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>
        </motion.div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast {...toast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};
