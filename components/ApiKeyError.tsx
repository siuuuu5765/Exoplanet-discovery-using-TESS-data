import React from 'react';

const ApiKeyError: React.FC = () => {
  return (
    <div className="min-h-screen bg-space-dark text-gray-200 flex flex-col items-center justify-center text-center p-8">
       <div className="max-w-2xl bg-space-blue/50 p-8 rounded-xl shadow-lg border border-red-500/50 backdrop-blur-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-3xl font-display font-bold text-red-400 mb-2">Configuration Error</h1>
        <p className="text-lg text-gray-300 mb-6">
            The Gemini API key is missing. This application cannot function without it.
        </p>
        <div className="text-left bg-space-dark/50 p-4 rounded-lg border border-space-light">
            <h2 className="text-md font-bold text-accent-gold mb-2">How to Fix on Vercel:</h2>
            <p className="text-sm text-gray-400">
               For security, Vercel requires a special prefix for variables to be used in the browser.
            </p>
            <ol className="list-decimal list-inside text-sm mt-2 space-y-2 text-gray-400">
                <li>Go to your project's settings on Vercel.</li>
                <li>Find the "Environment Variables" section.</li>
                <li>Add a new variable. The **NAME** must be exactly <code className="bg-space-light text-accent-cyan p-1 rounded">VITE_API_KEY</code>.</li>
                <li>Paste your Google AI Studio API key as the **VALUE** and save.</li>
                <li>**Redeploy** your application for the change to take effect.</li>
            </ol>
        </div>
       </div>
    </div>
  );
};

export default ApiKeyError;