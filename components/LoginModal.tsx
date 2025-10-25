
import React, { useState, useEffect, useRef } from 'react';
import { LockIcon, CloseIcon } from './IconComponents';

interface LoginModalProps {
  onClose: () => void;
  onLoginAttempt: (password: string) => boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginAttempt }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const isSuccess = onLoginAttempt(password);
    if (!isSuccess) {
      setError('Incorrect password. Please try again.');
      setPassword('');
       // Shake animation on error
      if (modalRef.current) {
        modalRef.current.classList.add('animate-shake');
        setTimeout(() => {
             modalRef.current?.classList.remove('animate-shake');
        }, 500);
      }
    }
  };

   // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  // Extend tailwind config for shake animation
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
  `;
  document.head.appendChild(style);

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
    >
        <div className="fixed inset-0" onClick={onClose}></div>
        <div ref={modalRef} className="relative w-full max-w-sm bg-slate-800/80 border border-slate-700 rounded-xl shadow-2xl p-6 animate-fade-in-down">
            <button 
                onClick={onClose} 
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Close"
            >
                <CloseIcon />
            </button>
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20">
                    <LockIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-100">Admin Access</h3>
                <p className="mt-1 text-sm text-slate-400">Please enter the password to continue.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label htmlFor="password-input" className="sr-only">Password</label>
                    <input
                        ref={inputRef}
                        id="password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full text-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-white placeholder-slate-400"
                    />
                </div>
                {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={!password}
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                >
                    Unlock
                </button>
            </form>
        </div>
    </div>
  );
};

export default LoginModal;
