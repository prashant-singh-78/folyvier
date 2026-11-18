import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Cpu,
  Info,
  Layers,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { resolveAssetUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const COMING_SOON = 'Information Coming Soon';

function SpecBox({ icon: Icon, label, value }) {
  const display = value && String(value).trim() ? String(value).trim() : COMING_SOON;
  const isPending = display.toLowerCase() === COMING_SOON.toLowerCase();

  return (
    <div className="p-4 rounded-xl bg-[#050C18]/75 border border-white/[0.07]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5EA2FF] mb-1.5">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <p className={`text-sm leading-relaxed ${isPending ? 'text-[#B8C2D1]/65 italic' : 'text-white/95'}`}>
        {display}
      </p>
    </div>
  );
}

export function ProductCard({ product, condition }) {
  const { user } = useAuth();

  if (!product) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-[#B8C2D1]">
        Verified product configuration for this condition is coming soon.
      </div>
    );
  }

  const images =
    Array.isArray(product.product_images) && product.product_images.length > 0
      ? product.product_images
      : ['/images/folibeir-device-650nm.jpg'];
  const features =
    Array.isArray(product.features) && product.features.length > 0
      ? product.features
      : [COMING_SOON];

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-[#1677FF]/25">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0D2140] via-[#071326] to-[#050505] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {condition && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1677FF]/15 border border-[#1677FF]/35 text-xs font-semibold text-[#7CB5FF]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {condition.category_label}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/35 text-xs font-bold text-red-300">
                <Zap className="w-3.5 h-3.5" />
                {product.wavelength || '650 nm'} Red Light
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#040914] aspect-[4/3] shadow-2xl">
              <img
                src={resolveAssetUrl(images[0])}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2.5 mt-3">
                {images.slice(0, 3).map((img, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden aspect-[4/3] border border-white/10 bg-[#040914]"
                  >
                    <img
                      src={resolveAssetUrl(img)}
                      alt={`${product.product_name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#1677FF] shrink-0 mt-0.5" />
              <p className="text-xs text-[#B8C2D1] leading-relaxed">
                FOLIBEIR displays only verified specifications supplied by the administrator.
              </p>
            </div>

            <Link
              to={user ? '/dashboard' : '/register'}
              className="btn-primary w-full py-3.5 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              {user
                ? 'Confirm Condition & Auto-Send to WhatsApp'
                : 'Sign Up to Receive Personalized WhatsApp Info'}
            </Link>
          </div>
        </div>

        {/* Right Specs Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {product.product_name}
            </h3>
            <p className="text-sm sm:text-base text-[#B8C2D1] mt-3 leading-relaxed">
              {product.product_description || COMING_SOON}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <SpecBox icon={Zap} label="Red Light Wavelength" value={product.wavelength || '650 nm'} />
            <SpecBox icon={Cpu} label="Device Components" value={product.components} />
            <SpecBox icon={Layers} label="Operating Specifications" value={product.specifications} />
            <SpecBox icon={Info} label="Usage Instructions" value={product.usage_instructions} />
            <div className="sm:col-span-2">
              <SpecBox icon={ShieldAlert} label="Safety Information" value={product.safety_information} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#050C18]/75 border border-white/[0.07]">
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5EA2FF] mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Product Features
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((feat, idx) => {
                const isPending = feat.trim().toLowerCase() === COMING_SOON.toLowerCase();
                return (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 text-sm ${
                      isPending ? 'text-[#B8C2D1]/65 italic' : 'text-white/90'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1677FF] mt-2 shrink-0" />
                    <span>{feat}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
