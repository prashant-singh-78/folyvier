import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
  ShieldAlert,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';

export function FoliviewChatbot() {
  const { user, setUser } = useAuth();
  const { chatbotOpen, setChatbotOpen, chatbotIntent, setChatbotIntent, setSelectedConditionCode } =
    useSite();
  const { showToast } = useToast();

  const [initialized, setInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [quickOptions, setQuickOptions] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pendingConditionCode, setPendingConditionCode] = useState('');

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending, pendingConditionCode]);

  useEffect(() => {
    if (!chatbotOpen || initialized) return;
    (async () => {
      try {
        const data = await api.initChatbot();
        setMessages([
          {
            id: 'welcome',
            sender: 'bot',
            text: data.welcome_message || "Welcome to FOLIBEIR! Let's understand your hair condition.",
          },
        ]);
        setQuickOptions(data.quick_options || []);
      } catch {
        setMessages([
          {
            id: 'welcome-fallback',
            sender: 'bot',
            text: "Welcome to FOLIBEIR! Let's understand your hair condition.",
          },
        ]);
        setQuickOptions([
          { id: 'opt_1', label: '1. I have mild frontal hair thinning.', action: 'condition', condition_code: 'condition-1' },
          { id: 'opt_2', label: '2. My scalp is becoming visible.', action: 'condition', condition_code: 'condition-2' },
          { id: 'opt_3', label: '3. I have significant hair loss.', action: 'condition', condition_code: 'condition-3' },
          { id: 'opt_4', label: '4. I want to know about FOLIBEIR technology.', action: 'technology' },
        ]);
      } finally {
        setInitialized(true);
      }
    })();
  }, [chatbotOpen, initialized]);

  useEffect(() => {
    if (chatbotOpen && initialized && chatbotIntent) {
      const intent = chatbotIntent;
      setChatbotIntent(null);
      handleAction(intent);
    }
  }, [chatbotOpen, initialized, chatbotIntent]);

  const handleAction = async ({ label = '', action = '', condition_code = '', message = '' }) => {
    const userDisplay = label || message;
    if (userDisplay) {
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: userDisplay }]);
    }

    setSending(true);
    try {
      const res = await api.sendChatMessage({
        message: message || label,
        action,
        condition_code,
      });

      if (res.selected_condition?.code) {
        setSelectedConditionCode(res.selected_condition.code);
        setPendingConditionCode(res.selected_condition.code);
      } else {
        setPendingConditionCode('');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: res.reply,
          product: res.recommended_product || null,
          condition: res.selected_condition || null,
          canConfirm: Boolean(res.can_confirm_assessment),
          requiresLogin: Boolean(res.requires_login),
        },
      ]);
      setQuickOptions(res.quick_options || []);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: 'Connection issue detected. Please try again in a moment.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleConfirmAssessment = async (conditionCode) => {
    if (!user) return;
    setConfirming(true);
    try {
      const res = await api.confirmConditionFromChat({
        selected_condition: conditionCode,
        confirm_whatsapp_consent: true,
      });
      setPendingConditionCode('');
      setUser((prev) => (prev ? { ...prev, selected_condition: conditionCode, whatsapp_consent: true } : prev));
      setMessages((prev) => [
        ...prev,
        {
          id: `confirmed-${Date.now()}`,
          sender: 'bot',
          text: `Confirmed! ${res.condition?.category_label} has been saved to your FOLIBEIR profile.\n\nAutomated WhatsApp notifications have been triggered simultaneously to:\n• Your registered WhatsApp number (${user.whatsapp_number})\n• The FOLIBEIR Business Owner desk`,
          automationDone: true,
        },
      ]);
      showToast('Assessment saved & Dual WhatsApp Automation triggered!', 'success');
    } catch (err) {
      showToast(err.message || 'Could not confirm assessment.', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const handleSubmitText = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setInput('');
    handleAction({ message: trimmed });
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setChatbotOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 px-4 py-3.5 rounded-2xl btn-primary shadow-2xl cursor-pointer"
        aria-label="Open FOLIBEIR AI Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1677FF]" />
        </div>
        <span className="text-sm font-semibold hidden sm:inline">FOLIBEIR AI Assistant</span>
      </motion.button>

      <AnimatePresence>
        {chatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-22 right-4 sm:right-5 z-[75] w-[calc(100vw-2rem)] sm:w-[410px] h-[600px] max-h-[78vh] rounded-2xl bg-[#071120] border border-[#1677FF]/40 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#0D2345] to-[#081529] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-[#5EA2FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">FOLIBEIR AI Assistant</h3>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    650 nm Tech & WhatsApp Automation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatbotOpen(false)}
                className="p-1.5 rounded-lg text-[#B8C2D1] hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Non-diagnostic banner */}
            <div className="px-3.5 py-2 bg-[#0A192F] border-b border-white/[0.06] flex items-center gap-2 text-[11px] text-[#B8C2D1]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#1677FF] shrink-0" />
              <span>Visual assessment guidance only — not a medical diagnosis.</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#1677FF] text-white rounded-br-sm'
                        : 'bg-[#0E203C] border border-white/[0.08] text-white/95 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}

                    {msg.product && (
                      <div className="mt-3 p-3 rounded-xl bg-[#050C18]/90 border border-[#1677FF]/30 space-y-1">
                        <p className="text-xs font-bold text-[#7CB5FF]">{msg.product.product_name}</p>
                        <p className="text-[11px] text-red-300 font-semibold">
                          Wavelength: {msg.product.wavelength || '650 nm'}
                        </p>
                        <p className="text-[11px] text-[#B8C2D1]">
                          <strong className="text-white">Specs:</strong> {msg.product.specifications}
                        </p>
                        <p className="text-[11px] text-[#B8C2D1]">
                          <strong className="text-white">Components:</strong> {msg.product.components}
                        </p>
                      </div>
                    )}

                    {msg.canConfirm && msg.condition && user && (
                      <button
                        type="button"
                        disabled={confirming}
                        onClick={() => handleConfirmAssessment(msg.condition.code)}
                        className="mt-3 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {confirming ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <MessageCircle className="w-3.5 h-3.5" />
                        )}
                        Confirm & Auto-Send to WhatsApp
                      </button>
                    )}

                    {msg.requiresLogin && (
                      <div className="mt-3 flex gap-2">
                        <Link
                          to="/register"
                          onClick={() => setChatbotOpen(false)}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#1677FF] text-white text-xs font-semibold text-center"
                        >
                          Sign Up
                        </Link>
                        <Link
                          to="/login"
                          onClick={() => setChatbotOpen(false)}
                          className="flex-1 py-2 px-3 rounded-lg bg-white/10 text-white text-xs font-semibold text-center"
                        >
                          Login
                        </Link>
                      </div>
                    )}

                    {msg.automationDone && (
                      <Link
                        to="/dashboard"
                        onClick={() => setChatbotOpen(false)}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        View WhatsApp Delivery Status in Dashboard →
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-2 text-xs text-[#B8C2D1] px-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1677FF]" />
                  <span>FOLIBEIR AI Assistant is responding…</span>
                </div>
              )}

              {!sending && quickOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAction(opt)}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-[#0A192F] hover:bg-[#1677FF]/25 border border-[#1677FF]/35 text-[#B8D4FF] hover:text-white transition-all cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {user && (
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-300/80">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Signed in as {user.full_name}</span>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmitText}
              className="p-3 bg-[#050C18] border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hair stages or 650 nm tech…"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0A192F]/80 border border-white/10 text-xs text-white placeholder:text-white/40 focus:border-[#1677FF] focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="p-2.5 rounded-xl btn-primary disabled:opacity-40 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
