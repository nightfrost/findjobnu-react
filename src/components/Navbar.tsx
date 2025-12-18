

import React, { useState } from "react";
import { useUser } from "../context/UserContext.shared";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    globalThis.location.href = "/";
  };

  return (
  <nav className="bg-base-100/60 backdrop-blur-sm shadow-lg mb-5 sticky top-0 z-50 transition-colors">
      <div className="max-w-[1400px] w-full mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo now at the start */}
        <div className="flex items-center gap-2">
          <a href="/" className="btn btn-ghost text-xl normal-case px-2 flex items-center gap-2">
            <img src="/findjobnu-logo.svg" alt="FindJob.nu logo" className="h-8 w-8" />
            <span>FindJob.nu</span>
          </a>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
            <ul className="flex items-center gap-4 font-medium text-base">
              <li><a className="link link-hover" href="/profile">Arbejdssøgende</a></li>
              <li><a className="link link-hover" href="/settings">Arbejdsgiver</a></li>
              {user && <li><a className="link link-hover" href="/myjobs">Mine Jobs</a></li>}
              <li><a className="link link-hover" href="/cv">Det gode CV</a></li>
              <li><a className="link link-hover" href="/about">Om os</a></li>
              <li><a className="link link-hover" href="/contact">Kontakt</a></li>
            </ul>
          {!user ? (
            <div className="flex items-center gap-2">
              <a href="/register" className="btn btn-outline btn-success">Tilmeld</a>
              <a href="/login" className="btn btn-primary">Log ind</a>
            </div>
          ) : (
      <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar flex items-center justify-center"
                aria-label="Bruger menu"
              >
                <UserCircleIcon className="w-8 h-8 text-primary" />
              </button>
              <ul
                className="menu menu-m dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow text-base"
              >
                <li><a href="/profile">Profil</a></li>
                <li><a href="/settings">Indstillinger</a></li>
                <li><button className="btn btn-sm btn-error btn-outline" type="button" onClick={handleLogout}>Log ud</button></li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile burger */}
        <div className="md:hidden ml-auto flex items-center">
          <button
            type="button"
            aria-label="Åbn menu"
            className="btn btn-ghost btn-circle"
            onClick={() => setMobileOpen(o => !o)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-base-200 bg-base-100 shadow-inner">
          <div className="px-4 py-4 flex flex-col gap-4">
            <ul className="flex flex-col gap-2 font-medium text-base">
              <li><a className="link" href="/profile" onClick={() => setMobileOpen(false)}>Arbejdssøgende</a></li>
              <li><a className="link" href="/settings" onClick={() => setMobileOpen(false)}>Arbejdsgiver</a></li>
              {user && <li><a className="link" href="/myjobs" onClick={() => setMobileOpen(false)}>Mine Jobs</a></li>}
              <li><a className="link" href="/cv" onClick={() => setMobileOpen(false)}>Det gode CV</a></li>
              <li><a className="link" href="/about" onClick={() => setMobileOpen(false)}>Om os</a></li>
              <li><a className="link" href="/contact" onClick={() => setMobileOpen(false)}>Kontakt</a></li>
            </ul>
            {!user ? (
              <div className="flex flex-col gap-2">
                <a href="/register" className="btn btn-outline btn-success" onClick={() => setMobileOpen(false)}>Tilmeld</a>
                <a href="/login" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Log ind</a>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <a href="/profile" className="link justify-start" onClick={() => setMobileOpen(false)}>Profil</a>
                <a href="/settings" className="link justify-start" onClick={() => setMobileOpen(false)}>Indstillinger</a>
                <button type="button" className="btn btn-error btn-outline" onClick={() => { handleLogout(); setMobileOpen(false); }}>Log ud</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;