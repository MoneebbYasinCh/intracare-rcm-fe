import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/cash-intelligence/dashboard', label: 'Cash Intelligence' },
  { to: '/revenue-opportunity', label: 'Opportunity Engine' },
  { to: '/operational-intelligence', label: 'Operational Insights' },
];

export function HomePlaceholderPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: "url('/Landingpage.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Navigation */}
      <header className="relative z-10 w-[95%] md:w-[90%] mx-auto py-5">
          <nav className="flex items-center justify-between md:justify-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded border border-white/30 text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center justify-center gap-8 md:gap-12">
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
              {isAuthenticated && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 font-poppins text-sm text-white/70 hover:text-[#FF7A58] transition-colors ml-4 pl-4 border-l border-white/20"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </li>
              )}
            </ul>

            {/* Spacer for mobile to keep button left-aligned */}
            <div className="md:hidden w-10" />
          </nav>

        {/* Mobile menu dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className="bg-white/10 border border-white/20 rounded-lg p-2">
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
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded font-poppins text-sm text-white/70 hover:bg-white/10 hover:text-[#FF7A58] transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center w-[90%] mx-auto py-12 md:py-20">
        <div className="max-w-2xl">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
            Command Your Revenue.
            <br />
            Predict Your Cash.
            <br />
            Act With Precision.
          </h1>
          
          <p className="font-poppins text-base md:text-lg text-white/90 mt-6 max-w-lg leading-relaxed">
            An AI-powered revenue intelligence engine built for Revenue Officers to forecast liquidity, eliminate leakage, and drive measurable cash outcomes.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-[#FF7A58] hover:bg-[#e86a4a] px-6 py-3 font-poppins font-semibold text-sm text-white transition-colors"
            >
              Enter Revenue Command Center
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border-2 border-white bg-transparent hover:bg-white/10 px-6 py-3 font-poppins font-semibold text-sm text-white transition-colors"
            >
              Request Executive Demo
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Tagline */}
      <footer className="relative z-10 w-[90%] mx-auto py-8 md:py-12">
        <p className="font-poppins text-base md:text-lg text-white text-center leading-relaxed">
          Unify financial visibility, operational intelligence, and execution into a single
          <br className="hidden md:block" />
          decision layer – built on top of your existing RCM systems.
        </p>
      </footer>
    </div>
  );
}
