// App.tsx
import React from 'react';
import Header from './components/Header';
import ExoplanetFinder from './components/ExoplanetFinder';
import Footer from './components/Footer';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-space-dark text-gray-200 flex flex-col p-4 md:p-8">
            <Header />
            <main className="flex-grow">
                <ExoplanetFinder />
            </main>
            <Footer />
        </div>
    );
};

export default App;
