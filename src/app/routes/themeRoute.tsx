import { ThemeDetail } from "../../catalog/ThemeDetail";
import { getCatalogThemeById } from "../../data/fixtures";

export interface ThemeRouteViewProps {
  themeId: string;
}

export function ThemeRouteView({ themeId }: ThemeRouteViewProps) {
  const entry = getCatalogThemeById(themeId);

  if (!entry) {
    return (
      <section aria-label="Theme not found" className="theme-detail theme-detail--missing">
        <h2>Theme not found</h2>
        <p>No catalog entry matches this theme ID.</p>
        <a className="theme-detail__back" href="/">
          Back to catalog
        </a>
      </section>
    );
  }

  return <ThemeDetail backHref="/" entry={entry} />;
}
