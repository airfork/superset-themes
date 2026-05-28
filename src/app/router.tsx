import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { LayoutShell } from "../chrome/LayoutShell";
import { Pane } from "../pane/Pane";
import { Rail } from "../rail/Rail";
import { useFocusedTheme } from "../theme/useFocusedTheme";
import { parseCatalogRouteSearch } from "./routes/catalogRoute";
import {
  CompareRouteView,
  parseCompareRouteSearch,
  stateToCompareRouteSearch,
} from "./routes/compareRoute";
import { LabRouteView, parseLabRouteSearch } from "./routes/labRoute";

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
    const [expanded, setExpanded] = useState(false);

    // Sync URL ?theme= into the focused-theme context. Catalog drives, provider follows.
    useEffect(() => {
      if (search.theme && search.theme !== focused.theme.id) {
        setFocusedId(search.theme);
      }
    }, [search.theme, focused.theme.id, setFocusedId]);

    return (
      <LayoutShell
        expanded={expanded}
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
          <Pane
            entry={focused}
            expanded={expanded}
            onExpandToggle={() => setExpanded((value) => !value)}
            onPin={(themeId) => {
              // Phase 6 replaces this with the compare-mode state machine. For now
              // keep the legacy ?light=/?dark= URL contract so /compare still works.
              const entry = focused.theme.id === themeId ? focused : focused;
              const params: Record<string, string> = { tab: search.tab ?? "workspace" };
              if (entry.theme.type === "light") {
                params.light = themeId;
              } else {
                params.dark = themeId;
              }
              void navigate({ to: "/compare", search: params });
            }}
          />
        }
      />
    );
  },
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: parseCatalogRouteSearch,
});

// Transitional <main> wrapper for routes that haven't migrated to LayoutShell yet.
// /compare and /lab need it so the global skip link in RootLayout has a target on
// every route. Phase 6 (Task 20) and Phase 8 (Task 24) migrate them to the shell.
function LegacyRouteMain({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="legacy-route-main">
      {children}
    </main>
  );
}

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

const routeTree = rootRoute.addChildren([catalogRoute, compareRoute, labRoute]);

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
