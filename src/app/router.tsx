import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { LayoutShell } from "../chrome/LayoutShell";
import { Rail } from "../rail/Rail";
import { useFocusedTheme } from "../theme/useFocusedTheme";
import { parseCatalogRouteSearch } from "./routes/catalogRoute";
import {
  CompareRouteView,
  parseCompareRouteSearch,
  stateToCompareRouteSearch,
} from "./routes/compareRoute";
import { LabRouteView, parseLabRouteSearch } from "./routes/labRoute";
import { ThemeRouteView } from "./routes/themeRoute";

function RootLayout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Outlet />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const EMPTY_PINNED = new Set<string>();

const catalogRoute = createRoute({
  component: function CatalogRouteContainer() {
    const navigate = catalogRoute.useNavigate();
    const search = catalogRoute.useSearch();
    const { focused, setFocusedId } = useFocusedTheme();

    // Sync URL ?theme= into the focused-theme context. Catalog drives, provider follows.
    useEffect(() => {
      if (search.theme && search.theme !== focused.theme.id) {
        setFocusedId(search.theme);
      }
    }, [search.theme, focused.theme.id, setFocusedId]);

    return (
      <LayoutShell
        onOpenPalette={() => {
          /* palette wired in Phase 7 */
        }}
        rail={
          <Rail
            focusedThemeId={focused.theme.id}
            pinnedThemeIds={EMPTY_PINNED}
            onOpenPalette={() => {
              /* palette wired in Phase 7 */
            }}
            onSelect={(themeId) => {
              setFocusedId(themeId);
              void navigate({
                replace: true,
                search: { ...search, theme: themeId },
              });
            }}
          />
        }
        pane={
          <div className="layout-shell__pane-placeholder">
            <p>Pane placeholder</p>
            <p>Master/detail catalog content arrives in Phase 5.</p>
          </div>
        }
      />
    );
  },
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: parseCatalogRouteSearch,
});

// Transitional <main> wrapper for routes that haven't migrated to LayoutShell yet.
// Catalog already supplies #main-content via LayoutShell; themes/compare/lab need it here
// so the global skip link in RootLayout has a target on every route. Migrating these to
// LayoutShell happens in Tasks 18, 20, and 24.
function LegacyRouteMain({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="legacy-route-main">
      {children}
    </main>
  );
}

const themeRoute = createRoute({
  component: function ThemeRouteContainer() {
    const navigate = themeRoute.useNavigate();
    const { themeId } = themeRoute.useParams();

    return (
      <LegacyRouteMain>
        <ThemeRouteView
          onPinDark={(darkThemeId) => {
            void navigate({
              search: {
                dark: darkThemeId,
                tab: "workspace",
              },
              to: "/compare",
            });
          }}
          onPinLight={(lightThemeId) => {
            void navigate({
              search: {
                light: lightThemeId,
                tab: "workspace",
              },
              to: "/compare",
            });
          }}
          themeId={themeId}
        />
      </LegacyRouteMain>
    );
  },
  getParentRoute: () => rootRoute,
  path: "/themes/$themeId",
});

const compareRoute = createRoute({
  component: function CompareRouteContainer() {
    const navigate = compareRoute.useNavigate();
    const search = compareRoute.useSearch();

    return (
      <LegacyRouteMain>
        <CompareRouteView
          onStateChange={(nextState) => {
            void navigate({
              replace: true,
              search: stateToCompareRouteSearch(nextState),
            });
          }}
          search={search}
        />
      </LegacyRouteMain>
    );
  },
  getParentRoute: () => rootRoute,
  path: "/compare",
  validateSearch: parseCompareRouteSearch,
});

const labRoute = createRoute({
  component: function LabRouteContainer() {
    const navigate = labRoute.useNavigate();
    const search = labRoute.useSearch();

    return (
      <LegacyRouteMain>
        <LabRouteView
          onStartFromCatalog={(themeId) => {
            void navigate({
              search: { from: themeId },
              to: "/lab",
            });
          }}
          search={search}
        />
      </LegacyRouteMain>
    );
  },
  getParentRoute: () => rootRoute,
  path: "/lab",
  validateSearch: parseLabRouteSearch,
});

const routeTree = rootRoute.addChildren([catalogRoute, themeRoute, compareRoute, labRoute]);

export const router = createRouter({
  defaultNotFoundComponent: () => (
    <LegacyRouteMain>
      <section aria-label="Route not found" className="theme-detail theme-detail--missing">
        <h2>Route not found</h2>
        <p>The requested catalog route does not exist.</p>
        <a className="theme-detail__back" href="/">
          Back to catalog
        </a>
      </section>
    </LegacyRouteMain>
  ),
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
