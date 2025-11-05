// App.tsx
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ExoplanetFinder from './components/ExoplanetFinder';
import ApiKeyError from './components/ApiKeyError';

const App: React.FC = () => {
    // FIX: Check for VITE_API_KEY as a fallback for Vite-based environments.
    const apiKey = process.env.API_KEY || process.env.VITE_API_KEY;
    if (!apiKey) {
      return <ApiKeyError />;
    }

    return (
        <div className="bg-space-dark min-h-screen text-gray-200 font-sans flex flex-col">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-space-dark via-[#0c1a3e] to-black opacity-50 z-0"></div>
            
            <Header />
            
            <main className="flex-1 flex flex-col z-10 p-4 md:p-8">
                <ExoplanetFinder />
            </main>

            <Footer />
        </div>
    );
};

export default App;