import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { resolveAssetUrl } from '../../api/client';

export function ConditionCard({ condition, isSelected, onSelect, actionLabel = 'Select Condition' }) {
  const indicators = condition.visual_indicators || [];

  return (
    <motion.div
      layout
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect?.(condition.code)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(condition.code);
        }
      }}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-b from-[#0E2447]/95 to-[#071224]/95 border-2 border-[#1677FF] shadow-[0_20px_60px_-15px_rgba(22,119,255,0.45)]'
          : 'glass-card border border-white/10 hover:border-[#1677FF]/50'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#081325]">
        <img
          src={resolveAssetUrl(condition.image_url)}
          alt={condition.category_label}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071224] via-transparent to-black/35" />

        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#050505]/75 backdrop-blur-md border border-white/15 text-white">
            Condition {condition.stage_number}
          </span>
          {isSelected && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1677FF] text-white shadow-lg shadow-[#1677FF]/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Selected
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-1.5">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= condition.stage_number ? 'bg-[#1677FF]' : 'bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5EA2FF]">
            {condition.severity_tag}
          </p>
          <h3 className="text-xl font-bold text-white mt-1 group-hover:text-[#9BC5FF] transition-colors">
            {condition.title}
          </h3>
        </div>

        <p className="text-sm text-[#B8C2D1] leading-relaxed mb-4">{condition.description}</p>

        <ul className="space-y-1.5 mb-6 flex-1">
          {indicators.slice(0, 4).map((ind, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#B8C2D1]/95">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1677FF] mt-1.5 shrink-0" />
              <span>{ind}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 mt-auto border-t border-white/[0.08] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(condition.code);
            }}
            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#1677FF] text-white'
                : 'bg-white/[0.07] text-white hover:bg-[#1677FF]/25 border border-white/10'
            }`}
          >
            {isSelected ? 'Selected' : actionLabel}
          </button>

          <Link
            to={`/conditions/${condition.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#5EA2FF] hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
