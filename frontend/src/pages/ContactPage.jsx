import { useState } from 'react';
import { CheckCircle2, Clock, Loader2, Mail, MessageCircle, Send } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    whatsapp_number: '',
    subject: 'FOLIBEIR Product & 650 nm Technology Question',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitContact(form);
      setSent(true);
      setForm({
        full_name: '',
        email: '',
        whatsapp_number: '',
        subject: 'FOLIBEIR Product & 650 nm Technology Question',
        message: '',
      });
      showToast('Message received by Team FOLIBEIR!', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to send message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid-bg py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/30 text-xs font-semibold uppercase tracking-[0.16em] text-[#7CB5FF]">
            Contact FOLIBEIR
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Connect with Team FOLIBEIR</h1>
          <p className="text-base text-[#B8C2D1] leading-relaxed">
            Questions about the 650 nm Red Light Technology, account verification, or automated
            WhatsApp notifications? Reach out below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 space-y-6 self-start">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1677FF]/15 border border-[#1677FF]/35 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#5EA2FF]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5EA2FF]">
                  Support Email
                </p>
                <p className="text-sm font-medium text-white mt-0.5">support@folibeir.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Automated WhatsApp Assistance
                </p>
                <p className="text-sm text-[#B8C2D1] mt-0.5 leading-relaxed">
                  Register and complete your hair condition assessment in your Dashboard to trigger
                  automatic personalized WhatsApp messages.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1677FF]/15 border border-[#1677FF]/35 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#5EA2FF]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5EA2FF]">
                  Support Hours
                </p>
                <p className="text-sm text-[#B8C2D1] mt-0.5">Monday – Saturday, 9:00 AM – 7:00 PM</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-[#1677FF]/25">
            {sent ? (
              <div className="space-y-4 py-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h2 className="text-xl font-bold text-white">Message Sent Successfully</h2>
                <p className="text-sm text-[#B8C2D1] max-w-md mx-auto">
                  Thank you for contacting FOLIBEIR. Our support team will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-white">Send a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="WhatsApp Number (optional)"
                    value={form.whatsapp_number}
                    onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                  />
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your message here… *"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
