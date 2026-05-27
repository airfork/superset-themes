import { Copy, Download, Moon, Pencil, Sun } from "lucide-react";
import { useState } from "react";
import { PreviewTabs } from "../preview/PreviewTabs";
import { exportThemeJson } from "../theme-core/exportTheme";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

export interface ThemeDetailProps {
  backHref?: string;
  entry: CatalogThemeEntry;
  labHref?: string;
  onPinDark?: (themeId: string) => void;
  onPinLight?: (themeId: string) => void;
}

export function ThemeDetail({
  backHref = "/",
  entry,
  labHref = `/lab?from=${entry.theme.id}`,
  onPinDark,
  onPinLight,
}: ThemeDetailProps) {
  const [copyState, setCopyState] = useState<"copied" | "idle">("idle");
  const { meta, theme } = entry;
  const themeJson = exportThemeJson(entry);
  const downloadHref = `data:application/json;charset=utf-8,${encodeURIComponent(themeJson)}`;

  const copyThemeJson = async () => {
    await navigator.clipboard.writeText(themeJson);
    setCopyState("copied");
  };

  return (
    <section aria-label={`${theme.name} details`} className="theme-detail">
      <div className="theme-detail__header">
        <div>
          <a className="theme-detail__back" href={backHref}>
            Back to catalog
          </a>
          <p className="eyebrow">{meta.family}</p>
          <h2 id="theme-detail-title">{theme.name}</h2>
          <p>{theme.description}</p>
        </div>
        <dl className="theme-detail__facts">
          <div>
            <dt>Mode</dt>
            <dd>{theme.type}</dd>
          </div>
          <div>
            <dt>Contrast</dt>
            <dd>{meta.contrastTier}</dd>
          </div>
          <div>
            <dt>Terminal</dt>
            <dd>{meta.terminalPaletteQuality}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{meta.source}</dd>
          </div>
        </dl>
      </div>

      <div aria-label={`${theme.name} details`} className="theme-detail__actions" role="toolbar">
        <button
          className="catalog-action-button"
          disabled={theme.type !== "light"}
          onClick={() => onPinLight?.(theme.id)}
          type="button"
        >
          <Sun aria-hidden="true" />
          <span>Pin light</span>
        </button>
        <button
          className="catalog-action-button"
          disabled={theme.type !== "dark"}
          onClick={() => onPinDark?.(theme.id)}
          type="button"
        >
          <Moon aria-hidden="true" />
          <span>Pin dark</span>
        </button>
        <a className="catalog-action-button" href={labHref}>
          <Pencil aria-hidden="true" />
          <span>Edit in lab</span>
        </a>
        <button className="catalog-action-button" onClick={copyThemeJson} type="button">
          <Copy aria-hidden="true" />
          <span>{copyState === "copied" ? "Copied JSON" : "Copy JSON"}</span>
        </button>
        <a className="catalog-action-button" download={`${theme.id}.json`} href={downloadHref}>
          <Download aria-hidden="true" />
          <span>Download JSON</span>
        </a>
      </div>

      <ul aria-label={`${theme.name} tags`} className="theme-detail__tags">
        {meta.styleTags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>

      <PreviewTabs theme={theme} />
    </section>
  );
}
