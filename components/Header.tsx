
import React from 'react';
import { LogoutIcon } from './IconComponents';

interface HeaderProps {
  currentView: 'listener' | 'admin';
  onNavigate: (view: 'listener' | 'admin') => void;
  isAdminAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isAdminAuthenticated, onLogout }) => {
  const navLinkClasses = "px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "text-slate-300 hover:bg-slate-700/50";
  
  return (
    <header className="bg-slate-900/70 backdrop-blur-lg sticky top-0 z-30 border-b border-white/10">
      <div className="container mx-auto px-4 py-3 md:px-6 max-w-5xl flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
          Podcast Platform
        </h1>
        
        <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg">
            <button
                onClick={() => onNavigate('listener')}
                className={`${navLinkClasses} ${currentView === 'listener' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'listener' ? 'page' : undefined}
            >
                Listen
            </button>
            <button
                onClick={() => onNavigate('admin')}
                className={`${navLinkClasses} ${currentView === 'admin' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'admin' ? 'page' : undefined}
            >
                Admin
            </button>
            </nav>

            {isAdminAuthenticated && currentView === 'admin' && (
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    aria-label="Logout"
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            )}
        </div>

      </div>
    </header>
  );
};

export default Header;
