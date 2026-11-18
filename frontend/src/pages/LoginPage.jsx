import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { googleClientId } = useSite();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const googleBtnRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!googleClientId || !window.google?.accounts?.id || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        try {
          const loggedIn = await loginWithGoogle(response.credential);
          showToast(`Welcome back, ${loggedIn.full_name}!`, 'success');
          navigate(loggedIn.role === 'super_admin' ? '/admin' : '/dashboard', { replace: true });
        } catch (err) {
          setError(err.message || 'Google Sign-In failed.');
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'filled_black',
      size: 'large',
      width: 360,
      text: 'continue_with',
    });
  }, [googleClientId, loginWithGoogle, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email.trim(), password, rememberMe);
      showToast(`Welcome back, ${loggedIn.full_name}!`, 'success');
      const fallback = loggedIn.role === 'super_admin' ? '/admin' : '/dashboard';
      const target = location.state?.from?.pathname || fallback;
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-bg py-14 sm:py-20">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-3xl p-7 sm:p-9 border border-[#1677FF]/30 space-y-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/35 text-[11px] font-semibold text-[#7CB5FF]">
              <ShieldCheck className="w-3.5 h-3.5" />
              JWT · HTTP-Only Cookie Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white pt-1">
              Sign In to FOLIBEIR
            </h1>
            <p className="text-xs sm:text-sm text-[#B8C2D1]">
              Access your hair condition assessment, 650 nm product specs, and WhatsApp status.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#B8C2D1]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B8C2D1]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C2D1]/70 hover:text-white cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#B8C2D1] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#1677FF]"
                />
                Remember Me
              </label>
              <Link to="/forgot-password" className="text-[#5EA2FF] hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {/* Google Authentication */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="px-3 text-[11px] text-[#B8C2D1]/70 bg-[#0B192E] uppercase tracking-wider shrink-0">
              Or continue with
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {googleClientId ? (
            <div ref={googleBtnRef} className="flex justify-center" />
          ) : (
            <button
              type="button"
              onClick={() =>
                showToast(
                  'Configure GOOGLE_CLIENT_ID in backend/.env to activate live Google Sign-In.',
                  'info'
                )
              }
              className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-xs font-semibold text-white flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.86-3c-.98.66-2.23 1.06-3.42 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
              </svg>
              Continue with Google
            </button>
          )}

          <p className="text-center text-xs text-[#B8C2D1]">
            New to FOLIBEIR?{' '}
            <Link to="/register" className="text-[#5EA2FF] font-semibold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
