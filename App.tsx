// App.tsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ExoplanetFinder from './components/ExoplanetFinder';
import SelectApiKey from './components/SelectApiKey';

const App: React.FC = () => {
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [isCheckingKey, setIsCheckingKey] = useState(true);

    useEffect(() => {
        const checkKey = async () => {
            // The `window.aistudio` object is provided by the hosting environment.
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                try {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setApiKeyReady(hasKey);
                } catch (e) {
                    console.error("Error checking for API key:", e);
                    setApiKeyReady(false); // Default to asking for a key if check fails.
                }
            } else {
                // Fallback for environments where `aistudio` is not present.
                // Assume the key is set via `process.env` and proceed.
                // If it's not, the error will be caught gracefully by ExoplanetFinder.
                setApiKeyReady(true);
            }
            setIsCheckingKey(false);
        };

        checkKey();
    }, []);

    // This handler allows child components to signal an API key failure,
    // which will bring the user back to the selection screen.
    const handleApiKeyError = () => {
        setApiKeyReady(false);
    };

    if (isCheckingKey) {
        return (
            <div className="bg-space-dark min-h-screen flex items-center justify-center">
                <p className="text-lg text-accent-cyan animate-pulse">Initializing Security Protocol...</p>
            </div>
        );
    }

    if (!apiKeyReady) {
        return <SelectApiKey onKeySelected={() => setApiKeyReady(true)} />;
    }

    return (
        <div className="bg-space-dark min-h-screen text-gray-200 font-sans flex flex-col">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-space-dark via-[#0c1a3e] to-black opacity-50 z-0"></div>
            <Header />
            <main className="flex-1 flex flex-col z-10 p-4 md:p-8">
                <ExoplanetFinder onApiKeyError={handleApiKeyError} />
            </main>
            <Footer />
        </div>
    );
};

export default App;
