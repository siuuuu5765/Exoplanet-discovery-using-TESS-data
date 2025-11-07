// App.tsx
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ExoplanetFinder from './components/ExoplanetFinder';

const App: React.FC = () => {
    return (
        <div className="bg-space-dark min-h-screen text-gray-200 font-sans flex flex-col">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-space-dark via-[#0c1a3e] to-black opacity-50 z-0"></div>
            <Header />
            <main className="flex-1 flex flex-col z-10 p-4 md:p-8">
                {/* 
                  The ExoplanetFinder component now handles API errors internally.
                  The onApiKeyError prop is no longer needed as the app relies
                  exclusively on the Vercel environment variable.
                */}
                <ExoplanetFinder />
            </main>
            <Footer />
        </div>
    );
};

export default App;