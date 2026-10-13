import React from 'react';

/**
 * GarbaIcon represents traditional crossed Dandiya sticks with festive accents,
 * ghunghroo bells, tassels, and the celebratory strike spark of Garba & Dandiya Raas.
 */
export default function GarbaIcon({ className = 'w-5 h-5', style, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      style={{ verticalAlign: '-0.125em', ...style }}
      aria-hidden="true"
      {...props}
    >
      {/* Dandiya Stick 1 (Diagonal Left to Right) */}
      <rect
        x="3"
        y="10.8"
        width="18"
        height="2.4"
        rx="1.2"
        transform="rotate(45 12 12)"
      />
      
      {/* Dandiya Stick 2 (Diagonal Right to Left) */}
      <rect
        x="3"
        y="10.8"
        width="18"
        height="2.4"
        rx="1.2"
        transform="rotate(-45 12 12)"
      />

      {/* Decorative Ornamental Caps / Ghunghroo bells at ends */}
      <circle cx="3.8" cy="3.8" r="1.8" />
      <circle cx="20.2" cy="3.8" r="1.8" />
      <circle cx="3.8" cy="20.2" r="1.8" />
      <circle cx="20.2" cy="20.2" r="1.8" />

      {/* Celebratory Garba Sparkle / Raas Strike Star at Center */}
      <circle cx="12" cy="12" r="1.5" fill="#fef08a" />

      {/* Festive sparkles & energy beats */}
      <path
        d="M12 2.2V4.6M12 19.4V21.8M2.2 12H4.6M19.4 12H21.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
