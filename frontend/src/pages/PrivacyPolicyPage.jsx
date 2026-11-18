export function PrivacyPolicyPage() {
  return (
    <div className="grid-bg py-14 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 space-y-8 border border-white/10">
          <div className="space-y-2 border-b border-white/10 pb-6">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5EA2FF]">
              Legal & Data Protection
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
            <p className="text-xs text-[#B8C2D1]">Effective Date: November 2026 · FOLIBEIR Platform</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Data We Collect</h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              When you register for FOLIBEIR and submit a hair condition assessment, we store your
              full name, email address, mobile number, WhatsApp number, selected hair condition,
              assessment timestamps, and WhatsApp opt-in consent timestamp.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Automated WhatsApp Messaging & Consent</h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              FOLIBEIR uses the official Meta WhatsApp Business Cloud API. Automated customer
              WhatsApp messages are sent strictly after explicit customer opt-in consent is recorded.
              We store consent timestamps, follow Meta&apos;s customer-service messaging window and
              approved template rules, and never send unsolicited promotional messages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Account & Session Security</h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              Passwords are protected using Argon2 hashing. Sessions use signed JWT tokens inside
              HTTP-only cookies with login rate limiting and role-based access control. WhatsApp
              Cloud API credentials are stored solely on the secured backend server.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Your Control</h2>
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              You may update your profile, WhatsApp number, or opt-in consent anytime from your User
              Dashboard, or contact support@folibeir.com for data requests.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
