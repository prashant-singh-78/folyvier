import { motion } from 'framer-motion';
import { MessageCircle, ScanSearch, UserPlus } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Create Your Account.',
    description:
      'Register securely with your email, validated WhatsApp number, and explicit WhatsApp communication consent.',
    icon: UserPlus,
  },
  {
    number: '02',
    title: 'Select Your Hair Condition.',
    description:
      'Compare our three medically neutral visual assessment stages—Early Hair Thinning, Moderate Hair Loss, or Advanced Hair Loss—and confirm your selection.',
    icon: ScanSearch,
  },
  {
    number: '03',
    title: 'Receive Personalized Information on WhatsApp.',
    description:
      'Immediately upon confirmation, FOLIBEIR automatically dispatches personalized product & 650 nm technology details to your WhatsApp and alerts Team FOLIBEIR.',
    icon: MessageCircle,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-24 border-y border-white/[0.06] bg-[#060D1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/30 text-xs font-semibold uppercase tracking-[0.16em] text-[#7CB5FF] mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            From Visual Assessment to Automatic WhatsApp Guidance
          </h2>
          <p className="text-sm sm:text-base text-[#B8C2D1] mt-3">
            Three structured steps engineered for privacy, speed, and verified clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1677FF]/25 to-[#0A192F] border border-[#1677FF]/40 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#5EA2FF]" />
                  </div>
                  <span className="font-display text-3xl font-extrabold text-white/10">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">{step.title}</h3>
                <p className="text-sm text-[#B8C2D1] leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
