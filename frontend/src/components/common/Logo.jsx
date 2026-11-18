export function Logo({ className = '', showTagline = false }) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1677FF] via-[#0F4EC2] to-[#0A192F] p-[1px] shadow-lg shadow-[#1677FF]/25">
        <div className="w-full h-full rounded-[11px] bg-[#071426] flex items-center justify-center">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path
              d="M9 24C9 15.5 14 9 23 7C21.5 14.5 17 19.5 10.5 22.5"
              stroke="#1677FF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M11 25C14.5 19.5 19.5 15 24 13.5"
              stroke="#9BC5FF"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="22.5" cy="8.5" r="2.2" fill="#EF4444" />
          </svg>
        </div>
      </div>
      <div className="leading-none">
        <span className="font-display font-extrabold tracking-[0.14em] text-lg text-white">
          FOLI<span className="text-[#1677FF]">BEIR</span>
        </span>
        {showTagline && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#B8C2D1]/75 mt-0.5">
            650 nm Hair Tech Platform
          </p>
        )}
      </div>
    </div>
  );
}
