import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Phone } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({
        email: email.trim(),
        whatsapp_number: whatsappNumber.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showToast('Password updated successfully! Please sign in.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-bg py-14 sm:py-20">
      <div className="max-w-md mx-auto px-4 sm:px-6 space-y-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5EA2FF] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="glass-card rounded-3xl p-7 sm:p-9 border border-[#1677FF]/30 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-white">Reset Your Password</h1>
            <p className="text-xs sm:text-sm text-[#B8C2D1]">
              Enter your registered email address and WhatsApp number to set a new password.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                Registered Email
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
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                Registered WhatsApp Number (w/ Country Code)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#B8C2D1]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B8C2D1]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, A-z & 0-9"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C2D1]/70 hover:text-white cursor-pointer"
                  aria-label="Toggle new password visibility"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B8C2D1]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#050C18] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {loading ? 'Updating Password…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
