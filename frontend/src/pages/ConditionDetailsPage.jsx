import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, CheckCircle2, Eye, Loader2 } from 'lucide-react';
import { api, resolveAssetUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { ProductCard } from '../components/common/ProductCard';

export function ConditionDetailsPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { conditions, setSelectedConditionCode, openChatbot } = useSite();
  const [condition, setCondition] = useState(null);
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getConditionDetail(slug);
        if (!mounted) return;
        setCondition(data.condition);
        setMatchedProducts(data.products || []);
        if (data.condition?.code) setSelectedConditionCode(data.condition.code);
      } catch (err) {
        if (mounted) setError(err.message || 'Condition not found.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug, setSelectedConditionCode]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1677FF]" />
      </div>
    );
  }

  if (error || !condition) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-5">
        <h1 className="text-2xl font-bold text-white">Condition Not Found</h1>
        <p className="text-sm text-[#B8C2D1]">{error}</p>
        <Link to="/conditions" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Hair Conditions
        </Link>
      </div>
    );
  }

  const otherConditions = conditions.filter((c) => c.code !== condition.code);

  return (
    <div className="grid-bg py-12 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Link
          to="/conditions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5EA2FF] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          All Hair Conditions
        </Link>

        <div className="glass-card rounded-3xl overflow-hidden border border-[#1677FF]/25">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 relative bg-[#071326] min-h-[300px]">
              <img
                src={resolveAssetUrl(condition.image_url)}
                alt={condition.category_label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-transparent to-black/30" />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full bg-[#1677FF] text-white text-xs font-bold shadow-lg">
                  Condition {condition.stage_number} of 3
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5EA2FF]">
                  {condition.severity_tag}
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">
                  {condition.category_label}
                </h1>
                <p className="text-sm sm:text-base text-[#B8C2D1] mt-4 leading-relaxed">
                  {condition.detailed_overview || condition.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#050C18]/80 border border-white/[0.08]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#5EA2FF] mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Visual Characteristics
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(condition.visual_indicators || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#B8C2D1]">
                      <CheckCircle2 className="w-4 h-4 text-[#1677FF] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A192F]/80 border border-white/10 text-xs text-[#B8C2D1]">
                <strong className="text-white">Disclaimer:</strong> {condition.disclaimer}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={user ? '/dashboard' : '/register'}
                  className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                >
                  {user
                    ? 'Select & Auto-Send to WhatsApp'
                    : 'Sign Up to Confirm & Receive WhatsApp Info'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    openChatbot({
                      label: condition.category_label,
                      action: 'condition',
                      condition_code: condition.code,
                    })
                  }
                  className="btn-secondary px-5 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-[#5EA2FF]" />
                  Ask AI Assistant
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            FOLIBEIR Product Mapped to {condition.title}
          </h2>
          {matchedProducts.map((p) => (
            <ProductCard key={p.product_id} product={p} condition={condition} />
          ))}
        </div>

        {otherConditions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Explore Other Visual Stages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherConditions.map((other) => (
                <Link
                  key={other.code}
                  to={`/conditions/${other.slug}`}
                  className="glass-card glass-card-hover rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5EA2FF]">
                      Condition {other.stage_number}
                    </p>
                    <p className="text-base font-bold text-white mt-0.5">{other.title}</p>
                    <p className="text-xs text-[#B8C2D1] mt-1">{other.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#1677FF] shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
