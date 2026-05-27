import type { CSSProperties, ReactNode } from "react";
import type { SupersetTheme } from "../theme-core/themeTypes";
import { getThemeCssVars } from "./themeCssVars";

export interface PreviewFrameProps {
  children: ReactNode;
  className?: string;
  theme: SupersetTheme;
}

export function PreviewFrame({ children, className, theme }: PreviewFrameProps) {
  const classes = ["preview-frame", `preview-frame--${theme.type}`, className]
    .filter(Boolean)
    .join(" ");
  const style = getThemeCssVars(theme) as CSSProperties;

  return (
    <fieldset className={classes} style={style}>
      <legend className="sr-only">{theme.name} preview</legend>
      {children}
    </fieldset>
  );
}
