import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, MessageCircle, ScanFace, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

export function HeroSection() {
  const { user } = useAuth();
  const { openChatbot } = useSite();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#050505]">
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt="FOLIBEIR 650 nm Hair Technology"
          className="w-full h-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050C18]/90 to-[#0A192F]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />
        <div className="absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full bg-[#1677FF]/15 blur-[130px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-7"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A192F]/85 border border-[#1677FF]/35 text-xs font-semibold tracking-wide text-[#8EC0FF]">
              <Sparkles className="w-3.5 h-3.5 text-[#1677FF]" />
              650 nm Red Light Technology · Automated WhatsApp Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-white">
              Understand Your Hair.
              <span className="block blue-gradient-text mt-1">Discover Your Solution.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#B8C2D1] max-w-2xl leading-relaxed">
              Explore your hair condition and discover the FOLIBEIR technology designed to support
              your hair-care journey.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn-primary px-7 py-4 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center gap-2.5"
                >
                  <ScanFace className="w-5 h-5" />
                  Analyze My Hair
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => scrollToSection('hair-conditions')}
                  className="btn-primary px-7 py-4 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center gap-2.5 cursor-pointer"
                >
                  <ScanFace className="w-5 h-5" />
                  Analyze My Hair
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <Link
                to="/technology"
                className="btn-secondary px-7 py-4 rounded-xl text-sm sm:text-base font-semibold inline-flex items-center gap-2.5"
              >
                Explore FOLIBEIR
              </Link>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
              <div className="flex items-center gap-2.5 text-xs text-[#B8C2D1]">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-400/30 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-red-400" />
                </div>
                <span>650 nm Red Light System</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#B8C2D1]">
                <div className="w-8 h-8 rounded-lg bg-[#1677FF]/15 border border-[#1677FF]/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#5EA2FF]" />
                </div>
                <span>Verified Specs Only</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#B8C2D1]">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Auto WhatsApp Updates</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-[#1677FF]/25 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5EA2FF]">
                    FOLIBEIR Visual Engine
                  </p>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    3-Stage Hair Condition Guide
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                  650 nm Tech
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    stage: 'Condition 1',
                    title: 'Early Hair Thinning',
                    desc: 'Slightly reduced frontal density · Mild recession',
                    code: 'condition-1',
                  },
                  {
                    stage: 'Condition 2',
                    title: 'Moderate Hair Loss',
                    desc: 'Increasing scalp visibility · Top scalp thinning',
                    code: 'condition-2',
                  },
                  {
                    stage: 'Condition 3',
                    title: 'Advanced Hair Loss',
                    desc: 'Substantial frontal recession · Reduced coverage',
                    code: 'condition-3',
                  },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() =>
                      openChatbot({
                        label: `${item.stage}: ${item.title}`,
                        action: 'condition',
                        condition_code: item.code,
                      })
                    }
                    className="w-full text-left p-3.5 rounded-xl bg-[#050C18]/80 hover:bg-[#1677FF]/15 border border-white/[0.08] hover:border-[#1677FF]/50 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1677FF]">
                        {item.stage}
                      </span>
                      <p className="text-sm font-semibold text-white group-hover:text-[#9BC5FF]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#B8C2D1]/80 mt-0.5">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#B8C2D1] group-hover:text-[#1677FF] shrink-0" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openChatbot()}
                className="w-full py-3 px-4 rounded-xl bg-[#0A192F] hover:bg-[#1677FF]/20 border border-[#1677FF]/35 text-xs sm:text-sm font-semibold text-[#8EC0FF] hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#1677FF]" />
                Ask FOLIBEIR AI Assistant
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
