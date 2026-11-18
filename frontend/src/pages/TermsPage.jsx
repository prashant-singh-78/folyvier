export function TermsPage() {
  return (
    <div className="grid-bg py-14 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 space-y-8 border border-white/10">
          <div className="space-y-2 border-b border-white/10 pb-6">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5EA2FF]">
              Platform Terms
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms & Conditions</h1>
            <p className="text-xs text-[#B8C2D1]">Effective Date: November 2026 · FOLIBEIR Platform</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Non-Medical Visual Assessment Scope</h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              FOLIBEIR hair condition categories (Early Hair Thinning, Moderate Hair Loss, and
              Advanced Hair Loss) and the FOLIBEIR AI Assistant are provided solely for visual
              self-assessment and informational product exploration. They do not constitute medical
              diagnoses, clinical results, or medical treatment advice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Verified Product & 650 nm Specifications</h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              FOLIBEIR displays only verified product and 650 nm technology details supplied by the
              administrator. Unconfigured details are clearly marked as &quot;Information Coming
              Soon.&quot;
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. WhatsApp Automation Terms</h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              By providing your WhatsApp number and enabling WhatsApp communication consent, you
              confirm that the number belongs to you and consent to automated assessment-based
              FOLIBEIR product updates via WhatsApp.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Account Security</h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              Users are responsible for safeguarding their account credentials and agree not to
              misuse registration, authentication, or messaging endpoints.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
