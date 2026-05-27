import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
}

export function IconButton({ className, icon, label, type = "button", ...props }: IconButtonProps) {
  const classes = ["ui-icon-button", className].filter(Boolean).join(" ");

  return (
    <button aria-label={label} className={classes} title={label} type={type} {...props}>
      {icon}
    </button>
  );
}
