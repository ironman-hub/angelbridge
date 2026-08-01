// Angel Bridge Foundation, "on wheels" logo mark, inline so it renders crisply
// at any size with no extra network request. Used in the nav and footer.

export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  const gradId = "abLogoGrad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Angel Bridge Foundation"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f77ff" />
          <stop offset="1" stopColor="#153ce1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="116" fill={`url(#${gradId})`} />
      {/* halo */}
      <ellipse
        cx="256"
        cy="118"
        rx="66"
        ry="20"
        fill="none"
        stroke="#f7b733"
        strokeWidth="14"
        transform="rotate(-10 256 118)"
      />
      {/* arch */}
      <path d="M120 340 Q256 60 392 340" fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" />
      {/* cables */}
      <g stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity="0.95">
        <line x1="193" y1="336" x2="193" y2="235" />
        <line x1="224" y1="336" x2="224" y2="211" />
        <line x1="256" y1="336" x2="256" y2="202" />
        <line x1="288" y1="336" x2="288" y2="211" />
        <line x1="319" y1="336" x2="319" y2="235" />
      </g>
      {/* deck */}
      <rect x="120" y="330" width="272" height="15" rx="7.5" fill="#fff" />
      {/* wheels */}
      <g fill="none" stroke="#fff" strokeWidth="12">
        <circle cx="182" cy="388" r="28" />
        <circle cx="330" cy="388" r="28" />
      </g>
      <g fill="#fff">
        <circle cx="182" cy="388" r="7" />
        <circle cx="330" cy="388" r="7" />
      </g>
    </svg>
  );
}
