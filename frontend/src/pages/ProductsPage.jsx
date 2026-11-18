import { useState } from 'react';
import { Filter, ShieldCheck } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { TechnologySection } from '../components/home/TechnologySection';
import { ProductCard } from '../components/common/ProductCard';

export function ProductsPage() {
  const { conditions, products } = useSite();
  const [filterCode, setFilterCode] = useState('all');

  const visibleProducts =
    filterCode === 'all'
      ? products
      : products.filter((p) => (p.condition_mapping || []).includes(filterCode));

  return (
    <div className="bg-[#050505]">
      {/* Dedicated 650 nm Red Light Technology System Section */}
      <TechnologySection />

      {/* Condition-Mapped FOLIBEIR Products */}
      <section className="grid-bg py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/30 text-xs font-semibold uppercase tracking-[0.16em] text-[#7CB5FF]">
                Condition-Mapped Product Information
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                FOLIBEIR Product Specifications
              </h1>
              <p className="text-sm sm:text-base text-[#B8C2D1] leading-relaxed">
                Explore verified product specifications dynamically mapped to Condition 1, Condition
                2, and Condition 3.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A192F]/80 border border-white/10 text-xs text-[#B8C2D1]">
              <ShieldCheck className="w-4 h-4 text-[#1677FF] shrink-0" />
              <span>Admin-verified data only · Zero fabricated claims</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8C2D1] mr-2">
              <Filter className="w-3.5 h-3.5 text-[#1677FF]" />
              Filter by Condition:
            </span>
            <button
              type="button"
              onClick={() => setFilterCode('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                filterCode === 'all'
                  ? 'bg-[#1677FF] text-white'
                  : 'bg-[#0A192F]/80 text-[#B8C2D1] hover:text-white border border-white/10'
              }`}
            >
              All ({products.length})
            </button>
            {conditions.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setFilterCode(c.code)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  filterCode === c.code
                    ? 'bg-[#1677FF] text-white'
                    : 'bg-[#0A192F]/80 text-[#B8C2D1] hover:text-white border border-white/10'
                }`}
              >
                Condition {c.stage_number}: {c.title}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {visibleProducts.map((product) => {
              const cond = conditions.find((c) =>
                (product.condition_mapping || []).includes(c.code)
              );
              return <ProductCard key={product.product_id} product={product} condition={cond} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
