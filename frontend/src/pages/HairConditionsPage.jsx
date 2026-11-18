import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { ConditionCard } from '../components/common/ConditionCard';
import { ProductCard } from '../components/common/ProductCard';

export function HairConditionsPage() {
  const { user } = useAuth();
  const {
    conditions,
    products,
    selectedConditionCode,
    setSelectedConditionCode,
    openChatbot,
  } = useSite();
  const navigate = useNavigate();

  const activeCondition =
    conditions.find((c) => c.code === selectedConditionCode) || conditions[0];
  const activeProduct = products.find((p) =>
    (p.condition_mapping || []).includes(activeCondition?.code || selectedConditionCode)
  );

  return (
    <div className="grid-bg py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="max-w-3xl space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/30 text-xs font-semibold uppercase tracking-[0.16em] text-[#7CB5FF]">
            Visual Hair Condition Categories
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Explore the Three Hair-Loss Conditions
          </h1>
          <p className="text-base text-[#B8C2D1] leading-relaxed">
            Compare the realistic visual progression from early frontal thinning to moderate and
            advanced hair loss. Select a condition to preview its mapped FOLIBEIR 650 nm product
            information or confirm it in your Dashboard to trigger automatic WhatsApp delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {conditions.map((cond) => (
            <ConditionCard
              key={cond.code}
              condition={cond}
              isSelected={selectedConditionCode === cond.code}
              onSelect={(code) => setSelectedConditionCode(code)}
            />
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#1677FF]/25">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#1677FF] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-[#B8C2D1] leading-relaxed">
              <strong className="text-white">Visual Assessment Notice:</strong> These three
              categories are for visual self-assessment only and must not be presented as medical
              diagnoses.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openChatbot({ action: 'explain_conditions', label: 'Compare all 3 hair conditions' })}
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#5EA2FF]" />
              Ask AI Assistant
            </button>
            <Link
              to={user ? '/dashboard' : '/register'}
              className="btn-primary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              {user ? 'Confirm in Dashboard' : 'Sign Up & Confirm'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {activeCondition && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5EA2FF]">
                  Mapped FOLIBEIR Product Match
                </p>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {activeCondition.category_label}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/conditions/${activeCondition.slug}`)}
                className="btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold self-start cursor-pointer"
              >
                Open Full Condition Details
              </button>
            </div>
            <ProductCard product={activeProduct} condition={activeCondition} />
          </div>
        )}
      </div>
    </div>
  );
}
