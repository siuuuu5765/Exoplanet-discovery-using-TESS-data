// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ExoplanetFinder from './components/ExoplanetFinder';
import SelectApiKey from './components/SelectApiKey';

// AI Studio provides `window.aistudio` for key management.
// FIX: The `declare global` block was removed to resolve a TypeScript error.
// The error "Subsequent property declarations must have the same type" indicates
// that `window.aistudio` is already typed in another file (likely a global .d.ts file).
// Re-declaring it here with a different (anonymous) type was causing a conflict.
// By removing this block, the component will use the existing global type definition.

const App: React.FC = () => {
    const [isKeyReady, setIsKeyReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkApiKey = useCallback(async () => {
        setIsLoading(true);
        try {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setIsKeyReady(true);
            } else {
                setIsKeyReady(false);
            }
        } catch (error) {
            console.error("Error checking for API key:", error);
            setIsKeyReady(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleKeySelected = () => {
        // Assume key is now available and re-render the app.
        setIsKeyReady(true);
    };
    
    const handleKeyError = () => {
        // If an API call fails due to a key issue, reset the state.
        setIsKeyReady(false);
        setIsLoading(false);
    }

    if (isLoading) {
        return (
            <div className="bg-space-dark min-h-screen flex items-center justify-center">
                <p className="text-lg text-accent-cyan animate-pulse">Initializing application...</p>
            </div>
        );
    }

    if (!isKeyReady) {
        return <SelectApiKey onKeySelected={handleKeySelected} />;
    }

    return (
        <div className="bg-space-dark min-h-screen text-gray-200 font-sans flex flex-col">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-space-dark via-[#0c1a3e] to-black opacity-50 z-0"></div>
            <Header />
            <main className="flex-1 flex flex-col z-10 p-4 md:p-8">
                <ExoplanetFinder onApiKeyError={handleKeyError} />
            </main>
            <Footer />
        </div>
    );
};

export default App;