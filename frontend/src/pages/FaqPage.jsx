import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

const FAQS = [
  {
    id: 'faq-1',
    category: 'Assessment',
    question: 'Are the three FOLIBEIR hair conditions a medical diagnosis?',
    answer:
      'No. Condition 1 (Early Hair Thinning), Condition 2 (Moderate Hair Loss), and Condition 3 (Advanced Hair Loss) are visual assessment categories for informational guidance only. They are not medical diagnoses.',
  },
  {
    id: 'faq-2',
    category: 'WhatsApp Automation',
    question: 'How does automatic WhatsApp messaging work?',
    answer:
      'Once you create an account, opt into WhatsApp communications, and confirm your hair condition in your Dashboard (or via FOLIBEIR AI Assistant), our backend automatically sends a personalized message to your registered WhatsApp number and simultaneously notifies the FOLIBEIR business owner via the official Meta WhatsApp Business Cloud API.',
  },
  {
    id: 'faq-3',
    category: 'Technology',
    question: 'What is the FOLIBEIR 650 nm Red Light Technology?',
    answer:
      'FOLIBEIR features a 650 nm red-light wavelength system. All device components, operating specifications, usage instructions, and safety information are managed directly by the FOLIBEIR administrator so only verified information is displayed.',
  },
  {
    id: 'faq-4',
    category: 'Privacy & Consent',
    question: 'Can I update my WhatsApp number or consent preferences?',
    answer:
      'Yes. At any time after logging in, you can open your User Dashboard to update your mobile number, WhatsApp number, or opt-in communication consent.',
  },
  {
    id: 'faq-5',
    category: 'Account',
    question: 'What if I forget my FOLIBEIR account password?',
    answer:
      'Use the Forgot Password link on the Login page, verify your registered email and WhatsApp number, and securely choose a new password.',
  },
];

export function FaqPage() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState('faq-1');

  const filtered = FAQS.filter(
    (item) =>
      item.question.toLowerCase().includes(query.toLowerCase()) ||
      item.answer.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid-bg py-14 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-3 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/30 text-xs font-semibold uppercase tracking-[0.16em] text-[#7CB5FF]">
            Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">FOLIBEIR FAQ</h1>
          <p className="text-sm sm:text-base text-[#B8C2D1] max-w-2xl mx-auto">
            Answers about hair condition stages, 650 nm technology, secure accounts, and automatic
            WhatsApp messaging.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#B8C2D1] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions (e.g., 650 nm, WhatsApp, password)…"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#081326] border border-white/15 focus:border-[#1677FF] focus:outline-none text-sm text-white"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`glass-card rounded-2xl overflow-hidden border ${
                  isOpen ? 'border-[#1677FF]/45' : 'border-white/[0.08]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? '' : item.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5EA2FF]">
                      {item.category}
                    </span>
                    <h2 className="text-base font-semibold text-white mt-0.5">{item.question}</h2>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#B8C2D1] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#1677FF]' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-4 text-sm text-[#B8C2D1] leading-relaxed border-t border-white/[0.06]">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Ready to start?</h3>
            <p className="text-xs text-[#B8C2D1]">
              Create your account to complete your visual assessment and trigger WhatsApp updates.
            </p>
          </div>
          <Link to="/register" className="btn-primary px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold">
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}
