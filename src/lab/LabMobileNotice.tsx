import { Monitor } from "lucide-react";

// The Theme Bench is a dense, multi-column editing surface that doesn't fold
// down to a phone in any honest way. Rather than ship a cramped rail, we show a
// short notice on narrow widths (CSS-gated to the layout's touch breakpoint) so
// the user knows to come back on a wider screen. The preview still renders below.
export function LabMobileNotice() {
  return (
    <aside className="lab-mobile-notice">
      <Monitor aria-hidden="true" className="lab-mobile-notice__icon" />
      <div>
        <p className="lab-mobile-notice__title">Open the Theme Bench on a wider screen</p>
        <p className="lab-mobile-notice__body">
          Generating, editing, and exporting themes needs a desktop-sized layout. The preview below
          still reflects the current draft.
        </p>
      </div>
    </aside>
  );
}
