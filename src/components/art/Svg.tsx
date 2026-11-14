import type { ReactNode, SVGProps } from "react";

/** Shared frame for every authored picture: 48x48, ink stroke 3, round caps and joins, flat fills. */
export function Svg48({
  size = 48,
  strokeWidth = 3,
  children,
  title,
  ...rest
}: { size?: number | string; strokeWidth?: number; children: ReactNode; title?: string } & Omit<SVGProps<SVGSVGElement>, "children">) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
      style={{ color: "var(--ink)", display: "block", flex: "none", ...rest.style }}
    >
      {children}
    </svg>
  );
}
