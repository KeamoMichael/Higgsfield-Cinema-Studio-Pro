import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeyContextType {
    hasKey: boolean;
    checkKey: () => Promise<void>;
    saveKey: (key: string) => void;
    removeKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasKey, setHasKey] = useState(false);

    const checkKey = async () => {
        // Check localStorage first
        if (localStorage.getItem('gemini_api_key')) {
            setHasKey(true);
            return;
        }

        // Check window.aistudio (IDX environment)
        if (window.aistudio) {
            const idxHasKey = await window.aistudio.hasSelectedApiKey();
            setHasKey(idxHasKey);
            return;
        }

        setHasKey(false);
    };

    const saveKey = (key: string) => {
        localStorage.setItem('gemini_api_key', key);
        setHasKey(true);
    };

    const removeKey = () => {
        localStorage.removeItem('gemini_api_key');
        setHasKey(false);
    };

    useEffect(() => {
        checkKey();
    }, []);

    return (
        <ApiKeyContext.Provider value={{ hasKey, checkKey, saveKey, removeKey }}>
            {children}
        </ApiKeyContext.Provider>
    );
};

export const useApiKey = () => {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKey must be used within an ApiKeyProvider');
    }
    return context;
};
