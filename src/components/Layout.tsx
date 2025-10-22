'use client';

import { LayoutDashboard, LogOut, Menu, Plus, Share2, User, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'add' | 'shared' | 'profile';
  onNavigate: (page: 'dashboard' | 'add' | 'shared' | 'profile') => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Resource', icon: Plus },
    { id: 'shared', label: 'Shared Dump', icon: Share2 },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="DumpIt Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                DumpIt
              </h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => signOut()}
                className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-sm animate-slide-down">
            <div className="flex flex-col p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-md text-left font-medium ${
                      currentPage === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
