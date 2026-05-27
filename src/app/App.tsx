import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";

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

function CatalogShell() {
  return (
    <section aria-labelledby="catalog-workspace-title" className="catalog-shell">
      <div className="catalog-shell__header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2 id="catalog-workspace-title">Theme catalog workspace</h2>
        </div>
        <p className="status-pill">Task 1 scaffold</p>
      </div>
      <div className="catalog-placeholder">
        <h3>Catalog implementation pending</h3>
        <p>
          This shell establishes the static app host for the approved implementation plan. Theme
          schema, fixtures, preview surfaces, filters, and lab workflows are intentionally left for
          later tasks.
        </p>
      </div>
    </section>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CatalogShell,
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
