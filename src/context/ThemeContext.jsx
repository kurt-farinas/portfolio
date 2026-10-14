import React, { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext();
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    try { const saved = localStorage.getItem('portfolio-theme'); return ['dark', 'light'].includes(saved) ? saved : null; }
    catch { return null; }
  });
  const theme = preference || 'dark';
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (preference) { try { localStorage.setItem('portfolio-theme', preference); } catch { /* Storage may be unavailable. */ } }
  }, [theme, preference]);
  const toggleTheme = () => setPreference(theme === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, setTheme: setPreference, toggleTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
