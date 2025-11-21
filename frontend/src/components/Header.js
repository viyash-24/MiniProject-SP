import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [open, setOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);

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

  const navLinkClass = ({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary hover:bg-gray-100'}`;
  
  
  const adminNavLinkClass = ({ isActive }) => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    return `px-3 py-2 rounded-md text-sm font-medium ${isAdminRoute ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary hover:bg-gray-100'}`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-700">{user.email}</div>
            </div>
          ) : (
            <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">SP</span>
              <span className="text-lg font-semibold text-gray-800">Smart Parking</span>
            </Link>
          )}
          <div className="hidden md:flex items-center gap-1">
            {!user && !isAdmin && <NavLink to="/" className={navLinkClass}>Home</NavLink>}
            {!user && !isAdmin && <NavLink to="/dashboard" className={navLinkClass}>Parking</NavLink>}
            {user && !isAdmin && <></>}
            {isAdmin && <NavLink to="/admin" className={adminNavLinkClass}>Admin</NavLink>}
          </div>
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary">Log in</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md">Sign up</Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.email}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                    <Link to="/profile" onClick={() => setProfileDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                    <button 
                      onClick={() => { logout(); setProfileDropdown(false); }} 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none" aria-label="Toggle menu">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200">
          <div className="space-y-1 px-4 py-3">
            {!isAdmin && <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>Home</NavLink>}
            {!isAdmin && <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>Parking</NavLink>}
            {user && !isAdmin && <NavLink to="/payment" className={navLinkClass} onClick={() => setOpen(false)}>Payment</NavLink>}
            {isAdmin && <NavLink to="/admin" className={adminNavLinkClass} onClick={() => setOpen(false)}>Admin</NavLink>}
            <div className="pt-2">
              {!user ? (
                <>
                  <Link to="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary" onClick={() => setOpen(false)}>Log in</Link>
                  <Link to="/register" className="block mt-1 px-3 py-2 text-sm font-medium text-white bg-primary rounded-md" onClick={() => setOpen(false)}>Sign up</Link>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm font-medium text-gray-900">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="px-3 py-2 text-xs text-gray-500">
                    {user.email}
                  </div>
                  <div className="flex gap-2">
                    <Link to="/profile" onClick={() => setOpen(false)} className="flex-1 mt-1 px-3 py-2 text-sm font-medium border rounded-md text-center">Profile</Link>
                    <button 
                      onClick={() => { logout(); setOpen(false); }} 
                      className="flex-1 mt-1 px-3 py-2 text-sm font-medium border rounded-md"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;