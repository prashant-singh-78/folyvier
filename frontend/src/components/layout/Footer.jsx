import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';

export function Footer() {
  return (
    <footer className="bg-[#040914] border-t border-white/[0.07] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Logo showTagline />
            <p className="text-sm text-[#B8C2D1] leading-relaxed">
              AI-powered visual hair condition assessment, 650 nm red-light hair-care technology,
              and automated WhatsApp Business Cloud API assistance.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              650 nm Red Light Wavelength System
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-[#B8C2D1]">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/conditions" className="hover:text-white transition-colors">Hair Conditions</Link></li>
              <li><Link to="/technology" className="hover:text-white transition-colors">650 nm Technology</Link></li>
              <li><Link to="/product" className="hover:text-white transition-colors">FOLIBEIR Product</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90 mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-[#B8C2D1]">
              <li><Link to="/about" className="hover:text-white transition-colors">About FOLIBEIR</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li>
                <Link to="/admin" className="inline-flex items-center gap-1.5 text-[#1677FF] hover:text-[#4D9AFF]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Super Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90 mb-4">
              Assessment Notice
            </h4>
            <div className="p-4 rounded-xl bg-[#0A192F]/70 border border-white/[0.08] text-xs text-[#B8C2D1] leading-relaxed">
              <strong className="text-white">Non-Diagnostic Notice:</strong> FOLIBEIR hair-loss
              categories are provided strictly for visual self-assessment and product guidance. They
              do not constitute a medical diagnosis or treatment claim.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B8C2D1]/70">
          <p>© {new Date().getFullYear()} FOLIBEIR. All rights reserved.</p>
          <p>Official Meta WhatsApp Business Cloud API · Verified Specifications Only</p>
        </div>
      </div>
    </footer>
  );
}
