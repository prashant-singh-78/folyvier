import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  MessageCircle,
  RefreshCw,
  Save,
  ScanFace,
  ShieldCheck,
  User,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { ConditionCard } from '../components/common/ConditionCard';
import { ProductCard } from '../components/common/ProductCard';

export function UserDashboardPage() {
  const { user, setUser, logout } = useAuth();
  const { conditions } = useSite();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState('condition-1');
  const [confirmConsent, setConfirmConsent] = useState(true);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [lastAutomation, setLastAutomation] = useState(null);

  // Profile editor
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    mobile_number: '',
    whatsapp_number: '',
    whatsapp_consent: true,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getUserDashboard();
      setDashboard(data);
      if (data.user) {
        setUser(data.user);
        setProfileForm({
          full_name: data.user.full_name || '',
          mobile_number: data.user.mobile_number || '',
          whatsapp_number: data.user.whatsapp_number || '',
          whatsapp_consent: Boolean(data.user.whatsapp_consent),
        });
        setConfirmConsent(Boolean(data.user.whatsapp_consent));
        if (data.user.selected_condition) {
          setSelectedCode(data.user.selected_condition);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  }, [setUser, showToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleConfirmAssessment = async () => {
    setSubmittingAssessment(true);
    try {
      const res = await api.submitAssessment({
        selected_condition: selectedCode,
        confirm_whatsapp_consent: confirmConsent,
      });
      setLastAutomation(res);
      showToast(
        'Assessment saved! Automatic WhatsApp messages dispatched to your WhatsApp & Team FOLIBEIR.',
        'success'
      );
      // Slight delay to let background dispatcher finalize status before refresh
      setTimeout(() => loadDashboard(), 900);
    } catch (err) {
      showToast(err.message || 'Could not submit assessment.', 'error');
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.updateProfile(profileForm);
      setUser(res.user);
      showToast('Profile & WhatsApp number updated successfully.', 'success');
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Profile update failed.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Logged out securely.', 'info');
    navigate('/');
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1677FF]" />
      </div>
    );
  }

  const activeCondition =
    dashboard?.selected_condition || conditions.find((c) => c.code === selectedCode) || null;
  const matchedProduct = dashboard?.matched_products?.[0] || null;
  const waMessages = dashboard?.whatsapp_messages || [];

  return (
    <div className="grid-bg py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#1677FF]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified FOLIBEIR Member
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white pt-1">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-sm text-[#B8C2D1]">
              Select and confirm your hair condition below to automatically receive personalized
              FOLIBEIR 650 nm technology details on WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadDashboard}
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Hair Condition Assessment & Automatic Dual WhatsApp Trigger */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5EA2FF] flex items-center gap-1.5">
                <ScanFace className="w-4 h-4" />
                Step 1 · Hair Condition Assessment
              </p>
              <h2 className="text-2xl font-bold text-white mt-1">
                Select Your Hair Condition & Trigger WhatsApp Automation
              </h2>
            </div>
            {dashboard?.selected_condition && (
              <span className="px-3.5 py-1.5 rounded-xl bg-[#1677FF]/15 border border-[#1677FF]/35 text-xs font-semibold text-[#8EC0FF]">
                Previously Selected: {dashboard.selected_condition.category_label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {conditions.map((cond) => (
              <ConditionCard
                key={cond.code}
                condition={cond}
                isSelected={selectedCode === cond.code}
                onSelect={(code) => setSelectedCode(code)}
                actionLabel="Choose Stage"
              />
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                Automatic Dual WhatsApp Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-[#B8C2D1] leading-relaxed">
                Confirming your selection immediately saves your assessment and automatically sends
                personalized WhatsApp messages via Meta Cloud API to{' '}
                <strong className="text-white">your WhatsApp ({user?.whatsapp_number})</strong> and
                the <strong className="text-white">FOLIBEIR Business Owner</strong>—no manual
                WhatsApp click required.
              </p>
              {!user?.whatsapp_consent && (
                <label className="flex items-center gap-2 text-xs text-emerald-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmConsent}
                    onChange={(e) => setConfirmConsent(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  Enable explicit WhatsApp opt-in consent so FOLIBEIR can message me automatically.
                </label>
              )}
            </div>

            <button
              type="button"
              disabled={submittingAssessment}
              onClick={handleConfirmAssessment}
              className="btn-primary px-7 py-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {submittingAssessment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {submittingAssessment
                ? 'Dispatching WhatsApp Messages…'
                : 'Confirm Selection & Auto-Send WhatsApp'}
            </button>
          </div>

          {lastAutomation && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 space-y-3">
              <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {lastAutomation.message}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {lastAutomation.whatsapp_automation?.customer_message && (
                  <div className="p-4 rounded-xl bg-[#050C18] border border-white/10">
                    <p className="font-bold text-[#7CB5FF] mb-1.5">
                      Automated Customer Message ({user?.whatsapp_number})
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-white/85 leading-relaxed">
                      {lastAutomation.whatsapp_automation.customer_message.message_body}
                    </pre>
                  </div>
                )}
                {lastAutomation.whatsapp_automation?.owner_notification && (
                  <div className="p-4 rounded-xl bg-[#050C18] border border-white/10">
                    <p className="font-bold text-emerald-300 mb-1.5">
                      Automated Business Owner Notification
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-white/85 leading-relaxed">
                      {lastAutomation.whatsapp_automation.owner_notification.message_body}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Matched FOLIBEIR Product */}
        {matchedProduct && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Your Matched FOLIBEIR Product Information</h2>
            <ProductCard product={matchedProduct} condition={activeCondition} />
          </section>
        )}

        {/* Profile & WhatsApp Communication Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Editor */}
          <form
            onSubmit={handleSaveProfile}
            className="lg:col-span-5 glass-card rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#1677FF]" />
              Profile & WhatsApp Settings
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18]/60 border border-white/10 text-sm text-white/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={profileForm.mobile_number}
                  onChange={(e) => setProfileForm((f) => ({ ...f, mobile_number: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={profileForm.whatsapp_number}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, whatsapp_number: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0A192F]/80 border border-white/10 text-xs text-[#B8C2D1] cursor-pointer">
              <input
                type="checkbox"
                checked={profileForm.whatsapp_consent}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, whatsapp_consent: e.target.checked }))
                }
                className="mt-0.5 accent-emerald-500 w-4 h-4"
              />
              <span>WhatsApp communication opt-in consent active</span>
            </label>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary w-full py-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Profile & WhatsApp Number
            </button>
          </form>

          {/* WhatsApp Communication Status Log */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              WhatsApp Communication Status
            </h2>

            {waMessages.length === 0 ? (
              <p className="text-xs text-[#B8C2D1]">
                No automated WhatsApp messages dispatched yet. Confirm your hair condition above to
                trigger personalized WhatsApp delivery.
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {waMessages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className="p-4 rounded-xl bg-[#050C18] border border-white/10 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                            msg.recipient_type === 'owner'
                              ? 'bg-[#1677FF]/20 text-[#7CB5FF]'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {msg.recipient_type === 'owner' ? 'Owner Alert' : 'Customer Message'}
                        </span>
                        <span className="text-[#B8C2D1]">{msg.recipient_number || 'Owner (not set)'}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          msg.message_status === 'sent' || msg.message_status === 'delivered' || msg.message_status === 'read'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : msg.message_status === 'failed'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-200'
                        }`}
                      >
                        {msg.message_status}
                      </span>
                    </div>
                    <pre className="text-xs text-white/85 whitespace-pre-wrap font-sans leading-relaxed line-clamp-5">
                      {msg.message_body}
                    </pre>
                    <p className="text-[10px] text-white/45 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : ''}
                      {msg.error_details ? ` · ${msg.error_details}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
