import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="mt-8 border-t bg-base-100/80 bg-base-100/60 backdrop-blur-sm shadow-lg">
    <div className="max-w-[1400px] w-full mx-auto px-4 py-6 flex flex-col gap-3 text-sm text-gray-600">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-gray-500">
          © {new Date().getFullYear()} <a href="https://rosenornsolutions.dk" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Rosenørn Solutions.</a> All rights reserved.
        </div>
        <div className="flex flex-wrap items-center gap-3 text-gray-600">
          <Link to="/about" className="link link-hover">Om os</Link>
          <Link to="/privatlivspolitik" className="link link-hover">Privatlivspolitik</Link>
          <Link to="/cookie-information" className="link link-hover">Cookie-information</Link>
          <Link to="/sitemap" className="link link-hover">Sitemap</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;