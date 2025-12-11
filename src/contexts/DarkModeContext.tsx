import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
    isDark: boolean;
    toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
    isDark: false,
    toggle: () => { },
});

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('dark-mode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('dark-mode', JSON.stringify(isDark));
    }, [isDark]);

    const toggle = () => setIsDark(!isDark);

    return (
        <DarkModeContext.Provider value={{ isDark, toggle }}>
            {children}
        </DarkModeContext.Provider>
    );
};
