import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "plain" | "danger" | "ok";
export type ButtonSize = "md" | "lg" | "kid";

interface Look {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
}

function cls({ variant = "plain", size = "md", pill }: Look, extra?: string): string {
  return [styles.btn, styles[variant], styles[size], pill ? styles.pill : "", extra ?? ""].filter(Boolean).join(" ");
}

/** Pressable with a hard 5px shadow that sinks while pressed. */
export function Button({
  variant,
  size,
  pill,
  className,
  type = "button",
  ...rest
}: Look & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cls({ variant, size, pill }, className)} {...rest} />;
}

/** Same look, for navigation. */
export function ButtonLink({ variant, size, pill, className, ...rest }: Look & ComponentProps<typeof Link>) {
  return <Link className={cls({ variant, size, pill }, className)} {...rest} />;
}
