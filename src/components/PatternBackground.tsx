interface Props {
  className?: string;
  id?: string;
}

/** Sekiz köşeli yıldızlardan oluşan ince İslami geometrik desen */
export default function PatternBackground({ className = '', id = 'islamic-pattern' }: Props) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="96" height="96" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#E8C766" strokeWidth="1">
            <rect x="30" y="30" width="36" height="36" />
            <rect x="30" y="30" width="36" height="36" transform="rotate(45 48 48)" />
            <circle cx="48" cy="48" r="4" />
            <path d="M0 14 L14 0 M82 0 L96 14 M0 82 L14 96 M82 96 L96 82" />
            <circle cx="0" cy="0" r="3" />
            <circle cx="96" cy="0" r="3" />
            <circle cx="0" cy="96" r="3" />
            <circle cx="96" cy="96" r="3" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
