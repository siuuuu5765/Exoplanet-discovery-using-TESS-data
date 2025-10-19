
import React from 'react';

const Footer: React.FC = () => (
  <footer className="text-center p-4 text-sm text-space-light z-10">
    <p>&copy; {new Date().getFullYear()} TESS Exoplanet Discovery Hub. For educational and demonstration purposes only.</p>
  </footer>
);

export default Footer;
