import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { ConditionCard } from '../common/ConditionCard';

export function HairConditionsSection() {
  const { conditions, selectedConditionCode, setSelectedConditionCode } = useSite();

  const handleSelect = (code) => {
    setSelectedConditionCode(code);
    const el = document.getElementById('product-recommendation');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="hair-conditions" className="relative py-20 sm:py-24 grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/30 text-xs font-semibold uppercase tracking-[0.16em] text-[#7CB5FF] mb-4">
              Three Hair Condition Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Select Your Visual Hair Condition
            </h2>
            <p className="text-sm sm:text-base text-[#B8C2D1] mt-3 leading-relaxed">
              Review the realistic visual progression from mild frontal thinning to advanced hair
              loss. Selecting a category updates the FOLIBEIR product recommendation below.
            </p>
          </div>

          <Link
            to="/conditions"
            className="btn-secondary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 self-start"
          >
            Compare All Stages
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {conditions.map((cond) => (
            <ConditionCard
              key={cond.code}
              condition={cond}
              isSelected={selectedConditionCode === cond.code}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="mt-8 p-4 rounded-2xl bg-[#0A192F]/60 border border-white/[0.08] flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1677FF] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-[#B8C2D1] leading-relaxed">
            <strong className="text-white">Visual Assessment Disclaimer:</strong> These three
            categories are provided for visual self-assessment only and must not be interpreted as
            medical diagnoses.
          </p>
        </div>
      </div>
    </section>
  );
}
