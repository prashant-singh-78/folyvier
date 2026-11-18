import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { ProductCard } from '../common/ProductCard';

export function ProductRecommendationSection() {
  const { conditions, products, selectedConditionCode, setSelectedConditionCode } = useSite();

  const activeCondition =
    conditions.find((c) => c.code === selectedConditionCode) || conditions[0] || null;
  const activeProduct =
    products.find((p) =>
      (p.condition_mapping || []).includes(activeCondition?.code || selectedConditionCode)
    ) ||
    products[0] ||
    null;

  return (
    <section id="product-recommendation" className="relative py-20 sm:py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/30 text-xs font-semibold uppercase tracking-[0.16em] text-[#7CB5FF] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Condition-Mapped FOLIBEIR Product Information
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Verified Product Recommendation
            </h2>
            <p className="text-sm sm:text-base text-[#B8C2D1] mt-3">
              Select a condition tab to explore the verified FOLIBEIR product information configured
              for each stage.
            </p>
          </div>

          <Link
            to="/product"
            className="btn-secondary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 self-start"
          >
            Full Product & Technology
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {conditions.map((cond) => {
            const active = cond.code === (activeCondition?.code || selectedConditionCode);
            return (
              <button
                key={cond.code}
                type="button"
                onClick={() => setSelectedConditionCode(cond.code)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#1677FF]/25 to-[#0A192F] border-[#1677FF] shadow-lg shadow-[#1677FF]/20'
                    : 'bg-[#081326]/70 border-white/[0.08] hover:border-[#1677FF]/40'
                }`}
              >
                <span
                  className={`text-[11px] font-bold uppercase tracking-[0.15em] ${
                    active ? 'text-[#7CB5FF]' : 'text-[#B8C2D1]/70'
                  }`}
                >
                  Condition {cond.stage_number}
                </span>
                <p className="text-base font-bold text-white mt-1">{cond.title}</p>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCondition?.code || 'empty'}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
          >
            <ProductCard product={activeProduct} condition={activeCondition} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
