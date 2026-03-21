import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { logout } from '../firebase';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Shield,
  History,
  Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'identity', label: 'Identity & Vision', icon: <Shield className="w-5 h-5" /> },
    { id: 'goals', label: 'Goal Structuring', icon: <Target className="w-5 h-5" /> },
    { id: 'story', label: 'Life Story', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'history', label: 'Ritual History', icon: <History className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-stone-900" />
          <span className="font-serif font-bold text-lg tracking-tight">Life Shaastra</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-40 bg-white md:relative md:flex md:flex-col md:w-72 border-r border-stone-200 transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="hidden md:flex items-center gap-3 p-8 mb-4">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight">Life Shaastra</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                activeTab === item.id 
                  ? "bg-stone-900 text-white shadow-md shadow-stone-200" 
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-stone-100">
          <div className="flex items-center gap-3 p-3 mb-4">
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 border border-stone-200 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-900 truncate">{user?.displayName || 'Seeker'}</p>
              <p className="text-xs text-stone-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-stone-50">
        {children}
      </main>
    </div>
  );
};
