// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
const ThemeContext = createContext();

// A custom hook to easily access the theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};

// 2. Create the Provider Component
export const ThemeProvider = ({ children }) => {
  // Initialize state based on localStorage or default to 'light'
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  // 3. Effect to apply the theme class to the document body
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first to ensure a clean update
    root.classList.remove('light-mode', 'dark-mode'); 

    // Add the current theme class
    root.classList.add(`${theme}-mode`);
    
    // Also update localStorage
    localStorage.setItem('theme', theme);
  }, [theme]); // Re-run effect whenever 'theme' state changes

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  // The value provided to components that consume the context
  const contextValue = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};