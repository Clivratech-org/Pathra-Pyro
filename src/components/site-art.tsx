export function AboutArtFactory({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 900 720" role="img" aria-label="fireworks factory">
      <defs>
        <linearGradient id="af-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5c0f1f" />
          <stop offset="55%" stopColor="#160b26" />
          <stop offset="100%" stopColor="#0d0716" />
        </linearGradient>
        <radialGradient id="af-r" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="rgba(255,220,140,0.45)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width="900" height="720" fill="url(#af-g)" />
      <rect width="900" height="720" fill="url(#af-r)" />
      <circle cx="160" cy="120" r="8" fill="#e8b94d" opacity="0.85" />
      <circle cx="740" cy="90" r="5" fill="#ff8a2b" />
      <circle cx="820" cy="260" r="6" fill="#ff5a3c" opacity="0.8" />
      <text x="450" y="320" textAnchor="middle" fontSize="110">
        🏭
      </text>
      <text x="450" y="410" textAnchor="middle" fill="#faf1e0" fontFamily="Georgia, serif" fontSize="34" fontWeight="700">
        Fireworks Factory
      </text>
      <text x="450" y="455" textAnchor="middle" fill="#e8b94d" fontFamily="monospace" fontSize="16" letterSpacing="3">
        SRI PATHRA PYRO WORLD
      </text>
    </svg>
  );
}

export function AboutArtShow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 900 720" role="img" aria-label="colourful fireworks">
      <defs>
        <linearGradient id="as-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7a1526" />
          <stop offset="50%" stopColor="#160b26" />
          <stop offset="100%" stopColor="#0d0716" />
        </linearGradient>
      </defs>
      <rect width="900" height="720" fill="url(#as-g)" />
      <circle cx="450" cy="280" r="90" fill="none" stroke="#e8b94d" strokeWidth="3" opacity="0.5" />
      <circle cx="450" cy="280" r="50" fill="#ff8a2b" opacity="0.35" />
      <text x="450" y="310" textAnchor="middle" fontSize="100">
        🎆
      </text>
      <text x="450" y="430" textAnchor="middle" fill="#faf1e0" fontFamily="Georgia, serif" fontSize="34" fontWeight="700">
        Colourful Fireworks
      </text>
      <text x="450" y="475" textAnchor="middle" fill="#e8b94d" fontFamily="monospace" fontSize="16" letterSpacing="3">
        GENUINE SIVAKASI
      </text>
    </svg>
  );
}

export function HeroArtSky({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 1000" role="img" aria-label="fireworks display">
      <defs>
        <linearGradient id="hs-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8a2b" />
          <stop offset="45%" stopColor="#5c0f1f" />
          <stop offset="100%" stopColor="#0d0716" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" rx="36" fill="url(#hs-g)" />
      <text x="400" y="460" textAnchor="middle" fontSize="120">
        🎇
      </text>
      <text x="400" y="560" textAnchor="middle" fill="#faf1e0" fontFamily="Georgia, serif" fontSize="36" fontWeight="700">
        Sky Display
      </text>
    </svg>
  );
}

export function HeroArtSparkler({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 700 900" role="img" aria-label="diwali sparkler">
      <defs>
        <linearGradient id="hk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8b94d" />
          <stop offset="55%" stopColor="#160b26" />
          <stop offset="100%" stopColor="#0d0716" />
        </linearGradient>
      </defs>
      <rect width="700" height="900" rx="36" fill="url(#hk-g)" />
      <text x="350" y="420" textAnchor="middle" fontSize="110">
        ✨
      </text>
      <text x="350" y="520" textAnchor="middle" fill="#faf1e0" fontFamily="Georgia, serif" fontSize="34" fontWeight="700">
        Sparklers
      </text>
    </svg>
  );
}
