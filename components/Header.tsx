import React from 'react';

const Header: React.FC = () => (
  <header className="text-center mb-8 md:mb-12">
    <h1 className="text-4xl md:text-6xl font-display font-bold text-accent-cyan tracking-wider drop-shadow-[0_2px_4px_rgba(0,255,255,0.4)]">
      TESS Exoplanet Discovery Hub
    </h1>
     <p className="font-display text-accent-gold text-sm md:text-base tracking-widest mt-2">
      ISEF 2024 Advanced Project Edition
    </p>
    <p className="text-md md:text-lg text-gray-300 mt-4 max-w-3xl mx-auto">
      Enter a TESS Input Catalog (TIC) ID to retrieve mission data and visualize potential new worlds.
    </p>
  </header>
);

export default Header;
