import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function computeStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score === 3 || score === 4) return { score, label: 'Good', color: 'bg-amber-400' };
  return { score, label: 'Strong', color: 'bg-emerald-400' };
}

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    whatsapp_number: '',
    password: '',
    confirm_password: '',
    accept_terms: false,
    accept_privacy: false,
    whatsapp_consent: true,
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => computeStrength(form.password), [form.password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.accept_terms || !form.accept_privacy) {
      setError('Please accept both Terms & Conditions and Privacy Policy.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      showToast('Account created successfully! Welcome to your FOLIBEIR Dashboard.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid-bg py-12 sm:py-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-3xl p-6 sm:p-9 border border-[#1677FF]/30 space-y-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/35 text-[11px] font-semibold text-[#7CB5FF]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure FOLIBEIR Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white pt-1">
              Create Your FOLIBEIR Account
            </h1>
            <p className="text-xs sm:text-sm text-[#B8C2D1]">
              Register to complete your hair condition assessment and receive automatic personalized WhatsApp updates.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.mobile_number}
                  onChange={(e) => setForm((f) => ({ ...f, mobile_number: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                  WhatsApp Number (w/ Country Code) *
                </label>
                <input
                  type="tel"
                  required
                  value={form.whatsapp_number}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min 8 chars, A-z & 0-9"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
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

              <div>
                <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    required
                    value={form.confirm_password}
                    onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
                    placeholder="Re-enter password"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C2D1]/70 hover:text-white cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {form.password && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#B8C2D1]">Password Strength</span>
                  <span className="font-semibold text-white">{strength.label}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full ${
                        i <= strength.score ? strength.color : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Legal & Separate WhatsApp Consent */}
            <div className="space-y-2.5 pt-2">
              <label className="flex items-start gap-2.5 text-xs text-[#B8C2D1] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.accept_terms}
                  onChange={(e) => setForm((f) => ({ ...f, accept_terms: e.target.checked }))}
                  className="mt-0.5 accent-[#1677FF] w-4 h-4"
                />
                <span>
                  I accept the{' '}
                  <Link to="/terms" className="text-[#5EA2FF] hover:underline">
                    Terms & Conditions
                  </Link>
                  . *
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-[#B8C2D1] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.accept_privacy}
                  onChange={(e) => setForm((f) => ({ ...f, accept_privacy: e.target.checked }))}
                  className="mt-0.5 accent-[#1677FF] w-4 h-4"
                />
                <span>
                  I accept the{' '}
                  <Link to="/privacy-policy" className="text-[#5EA2FF] hover:underline">
                    Privacy Policy
                  </Link>
                  . *
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-[#B8C2D1] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.whatsapp_consent}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp_consent: e.target.checked }))}
                  className="mt-0.5 accent-emerald-500 w-4 h-4 shrink-0"
                />
                <span>
                  <strong className="text-emerald-300 flex items-center gap-1.5 mb-0.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Separate WhatsApp Communication Consent
                  </strong>
                  I explicitly opt in to automatically receive personalized FOLIBEIR product and
                  650 nm technology information on my registered WhatsApp number after completing
                  my hair condition assessment.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {submitting ? 'Creating Account…' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-[#B8C2D1]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#5EA2FF] font-semibold hover:underline">
                Log in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
