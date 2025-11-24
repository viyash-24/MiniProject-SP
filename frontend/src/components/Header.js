import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaUser } from "react-icons/fa";
import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Header = () => {
  const [open, setOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };

    if (profileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdown]);

  const navLinkClass = ({ isActive }) => `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary text-white shadow-sm'
      : 'text-gray-700 hover:text-primary hover:bg-gray-100 dark:text-slate-200 dark:hover:text-primary dark:hover:bg-slate-800'
  }`;

  const adminNavLinkClass = ({ isActive }) => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    return `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
      isAdminRoute
        ? 'bg-primary text-white shadow-sm'
        : 'text-gray-700 hover:text-primary hover:bg-gray-100 dark:text-slate-200 dark:hover:text-primary dark:hover:bg-slate-800'
    }`;
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold shadow-sm">SP</span>
            <span className="text-lg font-semibold text-gray-800 dark:text-slate-50">Smart Parking</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {!isAdmin && <NavLink to="/" className={navLinkClass}>Home</NavLink>}
            {!isAdmin && <NavLink to="/dashboard" className={navLinkClass}>Parking</NavLink>}
            {user && !isAdmin && <NavLink to="/payment" className={navLinkClass}>Payment</NavLink>}
            {isAdmin && <NavLink to="/admin" className={adminNavLinkClass}>Admin</NavLink>}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors btn-soft"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {!user ? (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary dark:text-slate-200 btn-soft">Log in</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm btn-soft">Sign up</Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors btn-soft"
                >
                  {/* Profile Icon */}
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shadow-sm">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>

                  {/* Username */}
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>

                  {/* Dropdown Arrow */}
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {user.displayName || user.email?.split('@')[0] || 'User'}
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <FaUser className="text-gray-500" size={14} />
                        Profile
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="md:hidden border-t border-gray-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur"
          >
            <div className="space-y-1 px-4 py-3">
              {!isAdmin && <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>Home</NavLink>}
              {!isAdmin && <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>Parking</NavLink>}
              {user && !isAdmin && <NavLink to="/payment" className={navLinkClass} onClick={() => setOpen(false)}>Payment</NavLink>}
              {isAdmin && <NavLink to="/admin" className={adminNavLinkClass} onClick={() => setOpen(false)}>Admin</NavLink>}

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="mb-1 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-sm btn-soft"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </button>
                {!user ? (
                  <>
                    <Link to="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary dark:text-slate-200 btn-soft" onClick={() => setOpen(false)}>Log in</Link>
                    <Link to="/register" className="block mt-1 px-3 py-2 text-sm font-medium text-white bg-primary rounded-md btn-soft" onClick={() => setOpen(false)}>Sign up</Link>
                  </>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                      <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link to="/profile" onClick={() => setOpen(false)}
                        className="inline-flex mt-1 px-3 py-2 text-sm font-medium border rounded-md text-center btn-soft"
                      >
                        <FaUser size={14} /> Profile
                      </Link>
                      <button
                        onClick={() => { logout(); setOpen(false); }}
                        className="flex-1 mt-1 px-3 py-2 text-sm font-medium border rounded-md btn-soft"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;
