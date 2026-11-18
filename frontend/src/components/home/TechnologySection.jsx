import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Cpu, Info, Layers, ShieldAlert, Zap } from 'lucide-react';
import { resolveAssetUrl } from '../../api/client';
import { useSite } from '../../context/SiteContext';

const COMING_SOON = 'Information Coming Soon';

export function TechnologySection({ compact = false }) {
  const { technology } = useSite();
  const tech = technology || {};
  const features =
    Array.isArray(tech.features) && tech.features.length > 0
      ? tech.features
      : ['650 nm Red Light Wavelength System'];

  return (
    <section className="relative py-20 sm:py-24 bg-[#060D1A] border-y border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Device Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-red-500/25 bg-[#040914] shadow-[0_25px_70px_-20px_rgba(239,68,68,0.28)]">
              <img
                src={resolveAssetUrl(tech.hero_image || '/images/folibeir-device-650nm.jpg')}
                alt="FOLIBEIR 650 nm Red Light Wavelength System"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-red-600/90 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-lg">
                  <Zap className="w-3.5 h-3.5" />
                  Red Light Wavelength: {tech.wavelength || '650 nm'}
                </span>
              </div>
            </div>
          </div>

          {/* Tech Details */}
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/15 border border-red-500/35 text-xs font-semibold uppercase tracking-[0.16em] text-red-300">
              <Zap className="w-3.5 h-3.5" />
              650 nm Red Light Technology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {tech.title || 'FOLIBEIR 650 nm Red Light Wavelength System'}
            </h2>
            <p className="text-sm sm:text-base text-[#B8C2D1] leading-relaxed">
              {tech.technical_description || COMING_SOON}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-xl bg-[#050C18] border border-white/[0.08]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5EA2FF] flex items-center gap-1.5 mb-1">
                  <Cpu className="w-3.5 h-3.5" /> Device Components
                </p>
                <p className="text-xs sm:text-sm text-[#B8C2D1]">{tech.device_components || COMING_SOON}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#050C18] border border-white/[0.08]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5EA2FF] flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5" /> Operating Specifications
                </p>
                <p className="text-xs sm:text-sm text-[#B8C2D1]">
                  {tech.operating_specifications || COMING_SOON}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#050C18] border border-white/[0.08]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5EA2FF] flex items-center gap-1.5 mb-1">
                  <Info className="w-3.5 h-3.5" /> Usage Instructions
                </p>
                <p className="text-xs sm:text-sm text-[#B8C2D1]">
                  {tech.usage_instructions || COMING_SOON}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#050C18] border border-white/[0.08]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5EA2FF] flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Safety Information
                </p>
                <p className="text-xs sm:text-sm text-[#B8C2D1]">
                  {tech.safety_information || COMING_SOON}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {features.map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A192F] border border-white/10 text-xs text-white/90"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1677FF]" />
                  {f}
                </span>
              ))}
            </div>

            {compact && (
              <div className="pt-2">
                <Link
                  to="/technology"
                  className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                >
                  Explore Full Product & Technology
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
