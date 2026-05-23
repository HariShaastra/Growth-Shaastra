import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { logout } from '../firebase';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Zap, 
  Rocket, 
  BookMarked,
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Shield,
  Settings,
  Flame
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
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'life', label: 'Daily Ritual', icon: <Shield className="w-5 h-5" /> },
    { id: 'atomic', label: 'Habits', icon: <Zap className="w-5 h-5" /> },
    { id: 'karya', label: 'Projects', icon: <Rocket className="w-5 h-5" /> },
    { id: 'book', label: 'Reading', icon: <BookMarked className="w-5 h-5" /> },
    { id: 'settings', label: 'Setup', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#1c1917] flex flex-col xl:flex-row overflow-x-hidden">
      {/* Mobile Header */}
      <header className="xl:hidden bg-[#1c1917]/80 backdrop-blur-md border-b border-stone-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-display font-bold text-lg tracking-tight text-[#f5f5f4]">Growth Shaastra</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#f5f5f4]">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-40 bg-[#1c1917] xl:relative xl:flex xl:flex-col xl:w-72 border-r border-[#2c2927] transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
      )}>
        <div className="hidden xl:flex items-center gap-3 p-8 mb-4">
          <Logo className="w-10 h-10" />
          <span className="font-display font-bold text-xl tracking-tight text-white">Growth Shaastra</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-3xl transition-all duration-300 font-medium",
                activeTab === item.id 
                  ? "bg-amber-600 text-white shadow-xl shadow-amber-900/40" 
                  : "text-stone-400 hover:bg-stone-800 hover:text-amber-400"
              )}
            >
              <span className={cn("transition-colors", activeTab === item.id ? "text-white" : "text-stone-500")}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-stone-800 bg-stone-900/20">
          <div className="flex items-center gap-3 p-4 mb-4 bg-stone-800/50 rounded-3xl border border-stone-700/50">
            <div className="w-12 h-12 bg-stone-700 rounded-full flex items-center justify-center text-stone-400 border border-stone-600 overflow-hidden shadow-sm">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-7 h-7" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Seeker'}</p>
              <div className="flex items-center gap-1.5 pt-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">{profile?.streak || 0} Day Streak</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-5 py-3 text-stone-500 hover:text-red-400 hover:bg-red-900/10 rounded-2xl transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#1c1917] scroll-smooth">
        {children}
      </main>
    </div>
  );
};
