import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import {
  CatalogRouteView,
  parseCatalogRouteSearch,
  stateToCatalogRouteSearch,
} from "./routes/catalogRoute";
import { ThemeRouteView } from "./routes/themeRoute";

function RootLayout() {
  return (
    <>
      <header className="app-header">
        <div>
          <p className="eyebrow">Static theme workspace</p>
          <h1>Superset Theme Catalog</h1>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const catalogRoute = createRoute({
  component: function CatalogRouteContainer() {
    const navigate = catalogRoute.useNavigate();
    const search = catalogRoute.useSearch();

    return (
      <CatalogRouteView
        onStateChange={(nextState) => {
          void navigate({
            replace: true,
            search: stateToCatalogRouteSearch(nextState),
          });
        }}
        search={search}
      />
    );
  },
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: parseCatalogRouteSearch,
});

const themeRoute = createRoute({
  component: function ThemeRouteContainer() {
    const { themeId } = themeRoute.useParams();

    return <ThemeRouteView themeId={themeId} />;
  },
  getParentRoute: () => rootRoute,
  path: "/themes/$themeId",
});

const routeTree = rootRoute.addChildren([catalogRoute, themeRoute]);

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
