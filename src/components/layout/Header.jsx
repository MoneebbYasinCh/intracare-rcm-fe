import { StatusIndicator } from '../shared';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/cash-intelligence/dashboard', label: 'Cash Intelligence' },
  { to: '/revenue-opportunity', label: 'Revenue Opportunity' },
  { to: '/operational-intelligence', label: 'Operational Intelligence' },
];

export function Header({
  title = 'Cash Intelligence & Liquidity Forecast',
  subtitle = 'AI-powered financial command interface for predicting cash behavior and managing liquidity',
  systemStatus = 'active',
  lastUpdated = '2 minutes ago',
  dataRefresh = 'Real-Time',
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-header py-4 md:py-5 relative overflow-x-clip">
      <div className="w-[95%] md:w-[90%] max-w-full mx-auto">
        <div className="flex items-start justify-between gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <Link to="/">
              <h1 className="font-poppins font-semibold text-xl md:text-2xl lg:text-3xl text-white leading-tight break-words hover:text-white/90 transition-colors">
                {title}
              </h1>
            </Link>
            <p className="hidden md:block font-poppins text-sm md:text-base text-white mt-1 opacity-90">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded border border-white/30 text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <nav className="hidden md:flex md:flex-shrink-0 items-center gap-4">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `font-poppins text-sm md:text-base transition-colors ${
                        isActive
                          ? 'text-[#FF7A58] underline underline-offset-4'
                          : 'text-white hover:text-[#FFD7CC]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            {isAuthenticated && (
              <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                <div className="text-right">
                  <p className="font-poppins text-xs text-white/90 leading-tight">{user.name}</p>
                  <p className="font-poppins text-[10px] text-white/60 leading-tight">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 font-poppins text-xs text-white/80 hover:text-[#FF7A58] transition-colors"
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </nav>
        </div>

          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <nav className="bg-white/10 border border-white/20 rounded-lg p-2">
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded font-poppins text-sm transition-colors ${
                          isActive
                            ? 'text-[#FF7A58] bg-white/10'
                            : 'text-white hover:bg-white/10 hover:text-[#FFD7CC]'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                {isAuthenticated && (
                  <li className="border-t border-white/10 mt-1 pt-1">
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <div>
                        <p className="font-poppins text-xs text-white/90">{user.name}</p>
                        <p className="font-poppins text-[10px] text-white/60">{user.role}</p>
                      </div>
                      <button
                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-1 font-poppins text-xs text-white/70 hover:text-[#FF7A58] transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center mt-3 gap-2 text-white min-w-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0 sm:justify-self-start">
            <StatusIndicator status={systemStatus} />
            <span className="font-prompt text-sm md:text-base break-words">AI System Active</span>
          </div>

          <div className="text-xs md:text-sm min-w-0 sm:text-center sm:justify-self-center">
            <span className="font-prompt break-words">Last Updated: {lastUpdated}</span>
          </div>

          <div className="text-xs md:text-sm min-w-0 sm:justify-self-end">
            <span className="font-prompt break-words inline-flex items-center gap-1.5">
              <RefreshCw size={13} strokeWidth={2.5} className="opacity-95" />
              <span>Data Refresh: {dataRefresh}</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border opacity-50" />
    </header>
  );
}
