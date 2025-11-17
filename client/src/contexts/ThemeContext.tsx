import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (t: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            setThemeState(stored);
            document.documentElement.classList.toggle('dark', stored === 'dark');
        } else {
            // Tự động theo prefers-color-scheme nếu chưa có localStorage
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const init = prefersDark ? 'dark' : 'light';
            setThemeState(init);
            document.documentElement.classList.toggle('dark', init === 'dark');
            localStorage.setItem('theme', init);
        }
    }, []);

    const setTheme = (t: 'light' | 'dark') => {
        setThemeState(t);
        document.documentElement.classList.toggle('dark', t === 'dark');
        localStorage.setItem('theme', t);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
};