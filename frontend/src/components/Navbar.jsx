import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Code2, LayoutDashboard, MessageSquareText, FileText, ListChecks, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Mock Interview', path: '/interview', icon: MessageSquareText },
    { name: 'Resume Analyzer', path: '/resume-analyze', icon: FileText },
    { name: 'Code Explainer', path: '/code-explain', icon: Code2 },
    { name: 'LeetCode Tracker', path: '/leetcode-tracker', icon: ListChecks },
  ];

  return (
    <nav className="border-b border-white/5 bg-background/60 backdrop-blur-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gradient">
              TechPrep AI
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'text-white bg-white/10' 
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : ''}`} />
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 border border-white/10 rounded-xl shadow-inner shadow-white/5"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-bold text-white leading-none capitalize">
                    {user.user_metadata?.full_name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter">Pro Member</span>
                </div>
                <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-text-secondary" />
                  )}
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all text-text-secondary group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : location.pathname !== '/login' && (
              <Link
                to="/login"
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
