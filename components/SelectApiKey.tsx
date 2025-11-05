// components/SelectApiKey.tsx
import React, { useState } from 'react';

interface SelectApiKeyProps {
    onKeySelected: () => void;
}

const SelectApiKey: React.FC<SelectApiKeyProps> = ({ onKeySelected }) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectKey = async () => {
        setIsSelecting(true);
        setError(null);
        try {
            await window.aistudio.openSelectKey();
            // After the dialog closes, we assume a key was selected.
            // The parent component (`App.tsx`) will handle the state change.
            onKeySelected();
        } catch (e) {
            console.error("Error opening select key dialog:", e);
            setError("Could not open the API key selection dialog. Please try refreshing the page.");
            setIsSelecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-space-dark text-gray-200 flex flex-col items-center justify-center text-center p-8">
            <div className="max-w-md bg-space-blue/50 p-8 rounded-xl shadow-lg border border-accent-cyan/50 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-accent-cyan mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 017.743-5.743z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 017.743-5.743z" />
                </svg>
                <h1 className="text-2xl font-display font-bold text-gray-100 mb-2">Authentication Required</h1>
                <p className="text-md text-gray-300 mb-6">
                    To use the TESS Exoplanet Discovery Hub, please select a Gemini API key.
                </p>
                <button
                    onClick={handleSelectKey}
                    disabled={isSelecting}
                    className="w-full bg-accent-magenta text-white font-bold py-3 px-6 rounded-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    {isSelecting ? 'Waiting for Selection...' : 'Select API Key'}
                </button>
                {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
                 <p className="text-xs text-gray-500 mt-4">
                   This application requires a valid API key with billing enabled to function. 
                   <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline ml-1">Learn more</a>.
                </p>
            </div>
        </div>
    );
};

export default SelectApiKey;
