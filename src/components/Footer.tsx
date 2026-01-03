import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/RosenornSolutions.png";

const Footer: React.FC = () => (
  <footer className="mt-8 border-t bg-base-100/80 backdrop-blur-sm shadow-lg">
    <div className="max-w-[1400px] w-full mx-auto px-4 py-8 text-sm text-gray-700">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <aside className="flex flex-col gap-3 text-base-content/70 w-full lg:max-w-xs lg:pl-4">
          <a href="https://rosenornsolutions.dk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-fit hover:no-underline">
            <img src={logo} alt="Rosenørn Solutions" className="h-10 w-auto" loading="lazy" />
            <span className="text-base font-semibold text-base-content">Rosenørn Solutions</span>
          </a>
          <span>© {new Date().getFullYear()} Rosenørn Solutions. All rights reserved.</span>
        </aside>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-4 w-full lg:max-w-3xl lg:ml-auto lg:pl-4 lg:pr-2">
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold text-base-content">Tjenester</p>
            <Link to="/jobsearch" className="link link-hover">Jobsøgning</Link>
            <Link to="/arbejdssogende" className="link link-hover">Arbejdssøgende</Link>
            <Link to="/cv" className="link link-hover">Det gode CV</Link>
            <span className="text-base-content/50 cursor-not-allowed" aria-disabled="true">Arbejdsgiver</span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold text-base-content">Firma</p>
            <Link to="/about" className="link link-hover">Om os</Link>
            <Link to="/contact" className="link link-hover">Kontakt</Link>
            <Link to="/sitemap" className="link link-hover">Sitemap</Link>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold text-base-content">Love og Regler</p>
            <Link to="/privatlivspolitik" className="link link-hover">Privatlivspolitik</Link>
            <Link to="/cookie-information" className="link link-hover">Cookie-information</Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;