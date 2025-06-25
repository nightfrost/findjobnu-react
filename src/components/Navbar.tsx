import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="navbar bg-base-100 shadow mb-4 relative">
      {/* Left: Burger menu */}
      <div className="flex-1 flex items-center">
        <div className="relative">
          <button
            className="btn btn-ghost btn-circle mr-2"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute left-0 mt-2 w-45 bg-base-100 shadow rounded z-50">
              <ul className="menu menu-lg menu-focus">
                <li>
                  <a href="#">Opret Jobopslag</a>
                </li>
                <li>
                  <a href="#">Kontakt</a>
                </li>
                <li>
                  <a href="#">Om os</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Center: Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <a href="/" className="btn btn-ghost text-xl normal-case">
          FindJob.nu
        </a>
      </div>
      {/* Right: Auth buttons */}
      <div className="flex-none gap-2 ml-4">
        <button className="btn btn-outline btn-primary mr-4">Tilmeld</button>
        <button className="btn btn-primary">Log ind</button>
      </div>
    </div>
  );
};

export default Navbar;