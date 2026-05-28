export default function TeamPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#122023] ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full max-h-48 max-w-48 opacity-30"
        aria-hidden="true"
      >
        {/* Head */}
        <circle cx="100" cy="58" r="26" fill="#e1fcad" />

        {/* Body / torso */}
        <path
          d="M68 110 C68 88 132 88 132 110 L138 155 H62 Z"
          fill="#e1fcad"
        />

        {/* Left arm holding racket */}
        <line x1="68" y1="118" x2="34" y2="148" stroke="#e1fcad" strokeWidth="10" strokeLinecap="round" />

        {/* Right arm */}
        <line x1="132" y1="118" x2="158" y2="140" stroke="#e1fcad" strokeWidth="10" strokeLinecap="round" />

        {/* Racket handle */}
        <line x1="22" y1="160" x2="38" y2="146" stroke="#e1fcad" strokeWidth="6" strokeLinecap="round" />

        {/* Racket head (oval) */}
        <ellipse
          cx="12"
          cy="170"
          rx="14"
          ry="18"
          stroke="#e1fcad"
          strokeWidth="4"
          fill="none"
          transform="rotate(-35 12 170)"
        />

        {/* Racket strings horizontal */}
        <line x1="3" y1="165" x2="21" y2="165" stroke="#e1fcad" strokeWidth="1.5" opacity="0.6"
          transform="rotate(-35 12 170)" />
        <line x1="2" y1="170" x2="22" y2="170" stroke="#e1fcad" strokeWidth="1.5" opacity="0.6"
          transform="rotate(-35 12 170)" />
        <line x1="4" y1="175" x2="20" y2="175" stroke="#e1fcad" strokeWidth="1.5" opacity="0.6"
          transform="rotate(-35 12 170)" />

        {/* Racket strings vertical */}
        <line x1="8" y1="155" x2="8" y2="185" stroke="#e1fcad" strokeWidth="1.5" opacity="0.6"
          transform="rotate(-35 12 170)" />
        <line x1="12" y1="153" x2="12" y2="187" stroke="#e1fcad" strokeWidth="1.5" opacity="0.6"
          transform="rotate(-35 12 170)" />
        <line x1="16" y1="155" x2="16" y2="185" stroke="#e1fcad" strokeWidth="1.5" opacity="0.6"
          transform="rotate(-35 12 170)" />

        {/* Tennis ball */}
        <circle cx="170" cy="145" r="10" fill="#e1fcad" opacity="0.7" />
        <path
          d="M163 140 Q170 148 177 140"
          stroke="#122023"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M163 150 Q170 142 177 150"
          stroke="#122023"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Legs */}
        <line x1="82" y1="155" x2="76" y2="195" stroke="#e1fcad" strokeWidth="12" strokeLinecap="round" />
        <line x1="118" y1="155" x2="124" y2="195" stroke="#e1fcad" strokeWidth="12" strokeLinecap="round" />
      </svg>
    </div>
  );
}
