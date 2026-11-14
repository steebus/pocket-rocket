import type { CSSProperties } from "react";

/** The gold coin with a "$". Flat fill, ink outline, a flat shade crescent. */
export function Coin({ size = 32, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  const stroke = size >= 40 ? 4 : 3;
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: "block", flex: "none", ...style }}
    >
      <circle cx="24" cy="24" r="21" fill="var(--gold)" stroke="var(--ink)" strokeWidth={stroke} />
      <path d="M38 12a17 17 0 0 1-23 25 17 17 0 0 0 23-25z" fill="var(--gold-shade)" />
      <text
        x="24"
        y="31.5"
        textAnchor="middle"
        fontFamily="var(--font)"
        fontWeight={900}
        fontSize="22"
        fill="var(--ink)"
      >
        $
      </text>
    </svg>
  );
}
