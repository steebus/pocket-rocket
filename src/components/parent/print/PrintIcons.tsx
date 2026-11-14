import { Svg48 } from "@/components/art/Svg";

/** Scissors, open, blades pointing up-right. Same 48 grid and stroke as the other icons. */
export function ScissorsIcon({ size = 24 }: { size?: number | string }) {
  return (
    <Svg48 size={size}>
      <circle cx="11" cy="35" r="6" fill="#fff" />
      <circle cx="11" cy="13" r="6" fill="#fff" />
      <path d="M16 17l26 18M16 31L42 13" />
      <circle cx="26" cy="24" r="1.6" fill="currentColor" stroke="none" />
    </Svg48>
  );
}

export function PrinterIcon({ size = 24 }: { size?: number | string }) {
  return (
    <Svg48 size={size}>
      <path d="M14 17V6h20v11" />
      <rect x="5" y="17" width="38" height="18" rx="5" fill="#fff" />
      <rect x="14" y="28" width="20" height="14" rx="2" fill="#ffd9cf" />
      <circle cx="36" cy="23" r="1.6" fill="currentColor" stroke="none" />
    </Svg48>
  );
}
