// App.tsx
import React from 'react';
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ExoplanetFinder from './components/ExoplanetFinder';
import Sidebar from './components/Sidebar';
import type { BatchResult } from './types';
import ApiKeyError from './components/ApiKeyError';

// FIX: Define the main App component to structure the application layout.
const App: React.FC = () => {
    const [batchTicIds, setBatchTicIds] = useState('');
    const [isBatchRunning, setIsBatchRunning] = useState(false);
    const [batchResults, setBatchResults] = useState<BatchResult[]>([]);

    const handleRunBatch = async () => {
        // This is a placeholder for the batch analysis logic.
        // In a real app, this would trigger multiple calls to `fetchAndAnalyzeTicData`.
        setIsBatchRunning(true);
        console.log("Running batch for:", batchTicIds);
        // Simulate API calls
        await new Promise(res => setTimeout(res, 2000));
        setIsBatchRunning(false);
    };

    // FIX: Check for the API key in both Vercel/Vite and local environments.
    const apiKey = (import.meta.env && import.meta.env.VITE_API_KEY) || process.env.API_KEY;
    if (!apiKey) {
      return <ApiKeyError />;
    }

    return (
        <div className="bg-space-dark min-h-screen text-gray-200 font-sans flex flex-col">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/background.jpg')] bg-cover bg-center opacity-10 z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-space-dark via-transparent to-space-dark z-0"></div>
            
            <main className="flex-1 flex z-10">
                <Sidebar 
                    batchTicIds={batchTicIds}
                    setBatchTicIds={setBatchTicIds}
                    onRunBatch={handleRunBatch}
                    isBatchRunning={isBatchRunning}
                    batchResults={batchResults}
                />
                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Header />
                    <ExoplanetFinder />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default App;