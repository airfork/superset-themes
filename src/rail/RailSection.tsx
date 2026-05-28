import type { ReactNode } from "react";

interface RailSectionProps {
  label: string;
  children: ReactNode;
}

export function RailSection({ label, children }: RailSectionProps) {
  return (
    <section className="rail-section" aria-label={label}>
      <h2 className="rail-section__label">{label}</h2>
      <div className="rail-section__rows">{children}</div>
    </section>
  );
}
