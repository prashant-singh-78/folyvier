import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, ShieldCheck, UserPlus, X } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isSuperAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Hair Conditions', to: '/conditions' },
    { label: 'Technology', to: '/technology' },
    { label: 'Product', to: '/product' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    showToast('You have been securely logged out.', 'info');
    navigate('/');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-[#050505]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        <Link to="/" onClick={() => setMobileOpen(false)} aria-label="FOLIBEIR Home">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-[#1677FF]/15 border border-[#1677FF]/30'
                    : 'text-[#B8C2D1] hover:text-white hover:bg-white/[0.05]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden lg:flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                to={isSuperAdmin ? '/admin' : '/dashboard'}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                {isSuperAdmin ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <LayoutDashboard className="w-4 h-4" />
                )}
                {isSuperAdmin ? 'Super Admin' : 'Dashboard'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#B8C2D1] hover:text-white border border-white/10 hover:border-red-400/40 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#B8C2D1] hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-lg text-[#B8C2D1] hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-white/[0.08] bg-[#071120]/95 backdrop-blur-2xl"
          >
            <div className="px-4 py-4 space-y-1.5">
              {navLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'text-white bg-[#1677FF]/20 border border-[#1677FF]/30'
                        : 'text-[#B8C2D1] hover:text-white hover:bg-white/[0.06]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to={isSuperAdmin ? '/admin' : '/dashboard'}
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {isSuperAdmin ? 'Super Admin Dashboard' : 'My Dashboard'}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn-secondary w-full py-2.5 rounded-xl text-sm font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn-secondary w-full py-2.5 rounded-xl text-sm font-semibold text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
