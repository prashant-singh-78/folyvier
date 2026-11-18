import { Link } from 'react-router-dom';
import { ArrowRight, Eye, MessageCircle, ShieldCheck, Zap } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="grid-bg py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl space-y-5">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/30 text-xs font-semibold uppercase tracking-[0.16em] text-[#7CB5FF]">
            About FOLIBEIR
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Hair-Care Technology Built Around Visual Clarity & Verified Information
          </h1>
          <p className="text-base sm:text-lg text-[#B8C2D1] leading-relaxed">
            FOLIBEIR unites a structured three-stage visual hair condition guide, our 650 nm red-light
            wavelength technology platform, an AI assistant, and automated WhatsApp Business Cloud
            API communication so users receive timely, accurate information without guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: '650 nm Wavelength Focus',
              body: 'Dedicated technical documentation around the FOLIBEIR 650 nm Red Light Wavelength System, configurable exclusively from verified administrator inputs.',
            },
            {
              icon: Eye,
              title: 'Medically Neutral Assessment',
              body: 'Three distinct visual categories help customers understand their appearance stage without ever making unauthorized medical diagnoses.',
            },
            {
              icon: MessageCircle,
              title: 'Dual WhatsApp Automation',
              body: 'Upon confirmed assessment and explicit consent, FOLIBEIR automatically delivers personalized customer details and alerts the FOLIBEIR team.',
            },
            {
              icon: ShieldCheck,
              title: 'Zero Fabricated Claims',
              body: 'We strictly display only verified technical specifications, device components, and safety details published by the FOLIBEIR team.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass-card glass-card-hover rounded-2xl p-6 space-y-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#1677FF]/15 border border-[#1677FF]/35 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#5EA2FF]" />
                </div>
                <h2 className="text-base font-bold text-white">{item.title}</h2>
                <p className="text-xs sm:text-sm text-[#B8C2D1] leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>

        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[#1677FF]/25 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to Explore Your Hair Condition?
            </h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              Create your FOLIBEIR account in under a minute, select your condition, and receive
              personalized FOLIBEIR details directly on WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/register"
              className="btn-primary px-6 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/technology"
              className="btn-secondary px-6 py-3.5 rounded-xl text-sm font-semibold"
            >
              650 nm Technology
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
