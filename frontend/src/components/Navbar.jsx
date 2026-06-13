import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { BarChart3, Code2, Cpu, FileSpreadsheet, Compass, Search, LogOut } from 'lucide-react';
import { logout } from '../services/api';

function Navbar() {
  const { username } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: `/dashboard/${username}`, icon: BarChart3 },
    { name: 'Repositories', path: `/dashboard/${username}/repos`, icon: Code2 },
    { name: 'Skills & Tech', path: `/dashboard/${username}/skills`, icon: Cpu },
    { name: 'Career Insights', path: `/dashboard/${username}/insights`, icon: Compass },
    { name: 'Recruiter Report', path: `/dashboard/${username}/recruiter`, icon: FileSpreadsheet },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-dark-800 bg-dark-900/80 backdrop-blur-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center glow-border-purple">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent hidden sm:inline-block">
              DevMetrics <span className="text-brand-purple text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 ml-1">AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === `/dashboard/${username}`}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-purple/10 border border-brand-purple/30 text-white shadow-sm shadow-brand-purple/10'
                        : 'border border-transparent text-slate-400 hover:text-slate-100 hover:bg-dark-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-3.5 py-1.5 rounded-lg border border-dark-700 bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white text-sm transition-all duration-200"
            >
              <Search className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg border border-transparent text-slate-400 hover:text-white hover:bg-dark-800 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around overflow-x-auto border-t border-dark-800 py-2 bg-dark-900/90 px-2 space-x-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === `/dashboard/${username}`}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-brand-purple bg-brand-purple/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 mb-1" />
              {item.name}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default Navbar;
