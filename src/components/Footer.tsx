import React from "react";

const Footer: React.FC = () => (
  <footer className="mt-8 py-4 text-center text-gray-500 border-t">
    © {new Date().getFullYear()} <a href="https://rosenornsolutions.dk" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Rosenørn Solutions.</a> All rights reserved.
  </footer>
);

export default Footer;