import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.shared";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
  <nav className="bg-base-100/60 backdrop-blur-sm shadow-lg mb-5 sticky top-0 z-50 transition-colors">
      <div className="max-w-[1400px] w-full mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo now at the start */}
        <div className="flex items-center gap-2">
          <Link to="/" className="btn btn-ghost text-xl normal-case px-2 flex items-center gap-2">
            <img src="/findjobnu-logo.svg" alt="FindJob.nu logo" className="h-8 w-8" />
            <span>FindJob.nu</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
            <ul className="flex items-center gap-4 font-medium text-base">
              <li><Link className="link link-hover" to="/jobsearch">Jobsøgning</Link></li>
              <li><Link className="link link-hover" to="/arbejdssogende">Arbejdssøgende</Link></li>
              <li>
                <span
                  className="tooltip tooltip-bottom text-base-content/50 cursor-not-allowed"
                  data-tip="Kommer snart!"
                  aria-disabled="true"
                >
                  Arbejdsgiver
                </span>
              </li>
              <li><Link className="link link-hover" to="/cv">Det gode CV</Link></li>
              <li><Link className="link link-hover" to="/contact">Kontakt</Link></li>
            </ul>
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/register" className="btn btn-outline btn-success">Tilmeld</Link>
              <Link to="/login" className="btn btn-primary">Log ind</Link>
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
                <li><Link to="/profile">Profil</Link></li>
                <li><Link to="/profile?panel=settings">Indstillinger</Link></li>
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
              <li><Link className="link" to="/jobsearch" onClick={() => setMobileOpen(false)}>Jobsøgning</Link></li>
              <li><Link className="link" to="/arbejdssogende" onClick={() => setMobileOpen(false)}>Arbejdssøgende</Link></li>
              <li>
                <span
                  className="tooltip tooltip-right text-base-content/50 cursor-not-allowed"
                  data-tip="Kommer snart!"
                  aria-disabled="true"
                >
                  Arbejdsgiver
                </span>
              </li>
              <li><Link className="link" to="/cv" onClick={() => setMobileOpen(false)}>Det gode CV</Link></li>
              <li><Link className="link" to="/contact" onClick={() => setMobileOpen(false)}>Kontakt</Link></li>
            </ul>
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link to="/register" className="btn btn-outline btn-success" onClick={() => setMobileOpen(false)}>Tilmeld</Link>
                <Link to="/login" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Log ind</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/profile" className="link justify-start" onClick={() => setMobileOpen(false)}>Profil</Link>
                <Link to="/profile?panel=settings" className="link justify-start" onClick={() => setMobileOpen(false)}>Indstillinger</Link>
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