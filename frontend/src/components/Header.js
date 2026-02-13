import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, User, LogOut, Menu, X, ChevronDown, MapPin, CreditCard, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Header = () => {
  const [open, setOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };
    if (profileDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdown]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const navLinkClass = ({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${
    isActive ? 'text-primary' : 'text-muted-foreground'
  }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              SP
            </div>
            <span className="text-lg font-bold tracking-tight">Smart Parking</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {!isAdmin && (
              <>
                <NavLink to="/" className={navLinkClass}>Home</NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>Find Parking</NavLink>
                {user && <NavLink to="/payment" className={navLinkClass}>Payment</NavLink>}
              </>
            )}
            {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 rounded-full border border-border bg-background pl-2 pr-4 py-1 hover:bg-accent transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-border bg-popover p-1 shadow-lg"
                    >
                      <div className="px-2 py-1.5 text-sm font-semibold">My Account</div>
                      <div className="h-px bg-border my-1" />
                      
                      <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      
                      {!isAdmin && (
                        <>
                          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                            <MapPin className="h-4 w-4" /> Parking
                          </Link>
                          <Link to="/payment" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                            <CreditCard className="h-4 w-4" /> Payment
                          </Link>
                        </>
                      )}
                      
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                          <Shield className="h-4 w-4" /> Admin
                        </Link>
                      )}

                      <div className="h-px bg-border my-1" />
                      
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
             <button onClick={toggleTheme} className="p-2 text-muted-foreground">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => setOpen(!open)} className="p-2 text-foreground">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="space-y-1 p-4">
              {!isAdmin && (
                <>
                  <NavLink to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent">Home</NavLink>
                  <NavLink to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent">Parking</NavLink>
                  {user && <NavLink to="/payment" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent">Payment</NavLink>}
                </>
              )}
              {isAdmin && <NavLink to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent">Admin</NavLink>}
              
              {!user ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to="/login" className="flex items-center justify-center px-4 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm font-medium">Log in</Link>
                  <Link to="/register" className="flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium">Sign up</Link>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 px-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm font-medium">{user.email}</div>
                  </div>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md">Sign out</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
