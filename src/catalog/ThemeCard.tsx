import { Eye, Moon, Sun } from "lucide-react";
import { PreviewFrame } from "../preview/PreviewFrame";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

export interface ThemeCardProps {
  detailHref?: string;
  entry: CatalogThemeEntry;
  pinHref?: string;
}

const TERMINAL_SWATCHES = ["red", "yellow", "green", "cyan", "blue", "magenta"] as const;

export function ThemeCard({ detailHref, entry, pinHref }: ThemeCardProps) {
  const { meta, theme } = entry;
  const PinIcon = theme.type === "light" ? Sun : Moon;
  const pinLabel = theme.type === "light" ? "Pin light" : "Pin dark";

  return (
    <article aria-label={theme.name} className="theme-card">
      <div className="theme-card__body">
        <div className="theme-card__header">
          <div>
            <p className="theme-card__family">{meta.family}</p>
            <h3>{theme.name}</h3>
          </div>
          <span className={`theme-card__type theme-card__type--${theme.type}`}>{theme.type}</span>
        </div>
        <p className="theme-card__description">{theme.description}</p>
        <ul aria-label={`${theme.name} tags`} className="theme-card__tags">
          {meta.styleTags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
      <PreviewFrame className="theme-card-preview" theme={theme}>
        <div className="theme-card-preview__chrome">
          <div className="theme-card-preview__sidebar">
            <span />
            <span />
            <span />
          </div>
          <div className="theme-card-preview__main">
            <div className="theme-card-preview__tabs">
              <span data-active />
              <span />
            </div>
            <div className="theme-card-preview__editor">
              <span />
              <span />
              <span />
              <strong />
            </div>
            <div className="theme-card-preview__terminal" aria-hidden="true">
              {TERMINAL_SWATCHES.map((token) => (
                <span
                  key={token}
                  style={{
                    background: theme.terminal[token],
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </PreviewFrame>
      <div className="theme-card__footer">
        <dl>
          <div>
            <dt>Contrast</dt>
            <dd>{meta.contrastTier}</dd>
          </div>
          <div>
            <dt>Terminal</dt>
            <dd>{meta.terminalPaletteQuality}</dd>
          </div>
        </dl>
        <div className="theme-card__actions">
          {pinHref ? (
            <a
              aria-label={`${pinLabel} ${theme.name}`}
              className="theme-card__detail-link"
              href={pinHref}
            >
              <PinIcon aria-hidden="true" />
              <span>{pinLabel}</span>
            </a>
          ) : null}
          <a className="theme-card__detail-link" href={detailHref ?? `/themes/${theme.id}`}>
            <Eye aria-hidden="true" />
            <span>View details</span>
          </a>
        </div>
      </div>
    </article>
  );
}
