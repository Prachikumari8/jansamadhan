import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  User as UserIcon, 
  PlusCircle, 
  Home as HomeIcon
} from 'lucide-react';
import { useStore } from '../store/useStore.ts';
import { translations } from '../services/i18n.ts';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon: Icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
        isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
      <span className="hidden md:inline">{children}</span>
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentLanguage } = useStore();
  const copy = translations[currentLanguage];
  const roleLabel = currentUser?.role === 'ADMIN' ? 'Admin' : currentUser?.role === 'STAFF' ? 'Staff' : 'User';

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 bg-slate-50 no-scrollbar">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[1001] shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14 items-center gap-2">
            <Link to="/" className="flex items-center space-x-2 group shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">JanSamadhan</span>
                <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Official</span>
              </div>
            </Link>

            <div className="flex items-center space-x-2 overflow-hidden">
              <nav className="flex items-center space-x-0.5">
                <NavLink to="/" icon={HomeIcon}>{copy.home}</NavLink>
                <NavLink to="/report" icon={PlusCircle}>{copy.report}</NavLink>
                <NavLink to="/dashboard" icon={LayoutDashboard}>{copy.dashboard}</NavLink>
                {currentUser?.role === 'ADMIN' && <NavLink to="/admin" icon={ShieldCheck}>{copy.admin}</NavLink>}
                {currentUser?.role === 'STAFF' && <NavLink to="/admin" icon={ShieldCheck}>{copy.admin}</NavLink>}
              </nav>

              <div className="flex items-center space-x-2 border-l border-slate-100 pl-3 ml-1">
                {currentUser ? (
                  <>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase tracking-wider border border-slate-200">
                      {roleLabel}
                    </span>
                    <Link to="/profile" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 overflow-hidden shadow-sm hover:ring-2 hover:ring-blue-600/20 transition-all">
                      {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4" />}
                    </Link>
                  </>
                ) : (
                  <Link to="/login" className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-semibold uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-colors">{copy.login}</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar">{children}</main>
    </div>
  );
};