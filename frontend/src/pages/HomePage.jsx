import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { HeroSection } from '../components/home/HeroSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { HairConditionsSection } from '../components/home/HairConditionsSection';
import { TechnologySection } from '../components/home/TechnologySection';
import { ProductRecommendationSection } from '../components/home/ProductRecommendationSection';

export function HomePage() {
  const { user } = useAuth();
  const { loading, error, refreshSiteData, openChatbot } = useSite();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 text-[#B8C2D1]">
        <Loader2 className="w-9 h-9 animate-spin text-[#1677FF]" />
        <p className="text-sm">Loading FOLIBEIR platform…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto gap-4">
        <p className="text-red-300 text-sm">{error}</p>
        <button
          type="button"
          onClick={refreshSiteData}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div>
      <HeroSection />
      <HowItWorksSection />
      <HairConditionsSection />
      <TechnologySection compact />
      <ProductRecommendationSection />

      {/* Automated WhatsApp CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E2448] via-[#0A192F] to-[#050C18] border border-[#1677FF]/35 p-8 sm:p-12">
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-[#1677FF]/20 blur-[90px] pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                Official Meta WhatsApp Business Cloud API Automation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Complete Your Hair Assessment & Receive Instant WhatsApp Details
              </h2>
              <p className="text-sm sm:text-base text-[#B8C2D1] max-w-2xl leading-relaxed">
                Create your account, select your hair condition, and FOLIBEIR automatically sends
                personalized 650 nm technology & product information directly to your registered
                WhatsApp number while notifying Team FOLIBEIR.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="btn-primary py-3.5 px-6 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {user ? 'Open Assessment Dashboard' : 'Create Free Account'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => openChatbot()}
                className="btn-secondary py-3.5 px-6 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#5EA2FF]" />
                Ask FOLIBEIR AI Assistant
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
