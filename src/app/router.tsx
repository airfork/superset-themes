import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { LayoutShell } from "../chrome/LayoutShell";
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

const catalogRoute = createRoute({
  component: function CatalogRouteContainer() {
    return (
      <LayoutShell
        onOpenPalette={() => {
          /* palette wired in Phase 7 */
        }}
        rail={
          <div className="layout-shell__rail-placeholder">
            <p>Rail placeholder</p>
            <p>Featured · Light · Dark coming in Phase 4.</p>
          </div>
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

const themeRoute = createRoute({
  component: function ThemeRouteContainer() {
    const navigate = themeRoute.useNavigate();
    const { themeId } = themeRoute.useParams();

    return (
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
      <CompareRouteView
        onStateChange={(nextState) => {
          void navigate({
            replace: true,
            search: stateToCompareRouteSearch(nextState),
          });
        }}
        search={search}
      />
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
      <LabRouteView
        onStartFromCatalog={(themeId) => {
          void navigate({
            search: { from: themeId },
            to: "/lab",
          });
        }}
        search={search}
      />
    );
  },
  getParentRoute: () => rootRoute,
  path: "/lab",
  validateSearch: parseLabRouteSearch,
});

const routeTree = rootRoute.addChildren([catalogRoute, themeRoute, compareRoute, labRoute]);

export const router = createRouter({
  defaultNotFoundComponent: () => (
    <section aria-label="Route not found" className="theme-detail theme-detail--missing">
      <h2>Route not found</h2>
      <p>The requested catalog route does not exist.</p>
      <a className="theme-detail__back" href="/">
        Back to catalog
      </a>
    </section>
  ),
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
