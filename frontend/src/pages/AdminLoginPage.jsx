import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from '../components/common/Logo';

export function AdminLoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@folibeir.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email.trim(), password, true);
      if (loggedIn.role !== 'super_admin') {
        setError('This account does not have Super Admin privileges.');
        return;
      }
      showToast('Authenticated as FOLIBEIR Super Admin.', 'success');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] grid-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B8C2D1] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to FOLIBEIR
          </Link>
          <Logo />
        </div>

        <div className="glass-card rounded-3xl p-8 border border-[#1677FF]/30 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/35 text-[11px] font-semibold text-[#7CB5FF]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin Access Only
            </div>
            <h1 className="text-2xl font-bold text-white pt-1">FOLIBEIR Super Admin</h1>
            <p className="text-xs text-[#B8C2D1]">
              Manage users, 650 nm products, hair conditions, and automated WhatsApp settings.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#B8C2D1]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B8C2D1]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Super Admin password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Sign In as Super Admin
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-[#0A192F]/80 border border-white/10 text-[11px] text-[#B8C2D1] space-y-1">
            <p className="font-semibold text-white">Default Local Seed Credentials:</p>
            <p>
              Email: <code className="text-[#7CB5FF]">admin@folibeir.com</code>
            </p>
            <p>
              Password: <code className="text-[#7CB5FF]">FolibeirAdmin@2026</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
