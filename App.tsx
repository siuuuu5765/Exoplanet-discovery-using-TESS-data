import React from 'react';
import Header from './components/Header';
import ExoplanetFinder from './components/ExoplanetFinder';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import ApiKeyError from './components/ApiKeyError';
import { isApiKeySet } from './services/geminiService';

const App: React.FC = () => {
  if (!isApiKeySet) {
    return <ApiKeyError />;
  }

  return (
    <div className="min-h-screen bg-space-dark flex flex-col">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(49,58,98,0.3)_0%,_rgba(10,15,30,0)_60%)] -z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 -z-0"></div>
      
      <main className="flex-grow container mx-auto p-4 md:p-8 z-10">
        <Header />
        <ExoplanetFinder />
      </main>
      
      <Footer />
      <Chatbot />
    </div>
  );
};

export default App;