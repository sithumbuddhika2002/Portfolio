import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, type ToastType } from '../components/common/Toast';

interface ToastData {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastData = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);
    }, []);

    const showSuccess = useCallback((message: string, duration = 3000) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message: string, duration = 4000) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const handleClose = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toastProps = toasts.map((toast) => ({
        ...toast,
        onClose: handleClose,
    }));

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
            {children}
            <ToastContainer toasts={toastProps} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
