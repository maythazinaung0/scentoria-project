export default function ScentoriaLogo({ className = 'w-6 h-6' }) {
  return (
    <svg
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Cap */}
      <rect x="7" y="1" width="10" height="5" rx="2" fill="currentColor" />
      {/* Neck */}
      <rect x="9" y="6" width="6" height="4" rx="1" fill="currentColor" opacity="0.7" />
      {/* Bottle shoulder curve */}
      <path
        d="M5 13 C5 11.5 6.5 10 9 10 L15 10 C17.5 10 19 11.5 19 13 L19 23 C19 24.7 17.7 26 16 26 L8 26 C6.3 26 5 24.7 5 23 Z"
        fill="currentColor"
        opacity="0.18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Shine line */}
      <line x1="8" y1="13.5" x2="8" y2="23" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      {/* Spray dots */}
      <circle cx="21" cy="7" r="1" fill="currentColor" opacity="0.7" />
      <circle cx="22.5" cy="10" r="0.85" fill="currentColor" opacity="0.5" />
      <circle cx="21" cy="13" r="0.7" fill="currentColor" opacity="0.35" />
    </svg>
  );
}