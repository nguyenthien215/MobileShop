import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Toast {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number; // ms
}

interface ToastCtx {
    toasts: Toast[];
    addToast: (message: string, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => {
        const id = crypto.randomUUID();
        const toast: Toast = {
            id,
            message,
            type: opts?.type || 'success',
            duration: opts?.duration || 2500
        };
        setToasts(prev => [...prev, toast]);
        setTimeout(() => removeToast(id), toast.duration);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
};