import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { Columns2, FlaskConical, Shuffle } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { LayoutShell } from "../chrome/LayoutShell";
import { ShortcutsOverlay } from "../chrome/ShortcutsOverlay";
import {
  buildThemeCommands,
  downloadThemeJsonCommand,
  nextThemeId,
  type PaletteCommand,
} from "../palette/commands";
import { usePalette } from "../palette/usePalette";
import { Pane } from "../pane/Pane";
import { Rail } from "../rail/Rail";
import { useFocusedTheme } from "../theme/useFocusedTheme";
import { parseCatalogRouteSearch } from "./routes/catalogRoute";
import { CompareRouteView, parseCompareRouteSearch } from "./routes/compareRoute";
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
    // Mirror of the rail's filter so ⌘K can seed itself with whatever's typed there.
    const [railFilter, setRailFilter] = useState("");
    const [shortcutsOpen, setShortcutsOpen] = useState(false);

    // Sync URL ?theme= into the focused-theme context. Catalog drives, provider follows.
    useEffect(() => {
      if (search.theme && search.theme !== focused.theme.id) {
        setFocusedId(search.theme);
      }
    }, [search.theme, focused.theme.id, setFocusedId]);

    // `.` enters compare mode with the focused theme as slot a and entry-state.
    // A ref keeps the listener mounted once while always reading the latest focus.
    const enterCompare = () => {
      const id = focused.theme.id;
      void navigate({ to: "/compare", search: { a: id, from: id } });
    };
    const enterCompareRef = useRef(enterCompare);
    enterCompareRef.current = enterCompare;
    useEffect(() => {
      const handler = (event: KeyboardEvent) => {
        if (event.key !== "." || event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }
        const target = event.target as HTMLElement | null;
        if (target) {
          const tag = target.tagName;
          if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            target.isContentEditable
          ) {
            return;
          }
        }
        event.preventDefault();
        enterCompareRef.current();
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, []);

    // "?" anywhere (except while typing) opens the keyboard-shortcut reference —
    // the convention power users reach for first.
    useEffect(() => {
      const handler = (event: KeyboardEvent) => {
        if (event.key !== "?" || event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }
        const target = event.target as HTMLElement | null;
        if (target) {
          const tag = target.tagName;
          if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            target.isContentEditable
          ) {
            return;
          }
        }
        event.preventDefault();
        setShortcutsOpen(true);
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, []);

    const selectTheme = (themeId: string) => {
      setFocusedId(themeId);
      void navigate({ replace: true, search: { ...search, theme: themeId } });
    };

    const focusedId = focused.theme.id;
    const commands: PaletteCommand[] = [
      ...buildThemeCommands(selectTheme),
      {
        id: "action-open-in-lab",
        label: "Open in Lab",
        section: "Actions",
        icon: FlaskConical,
        keys: ["open in lab", "lab", "editor"],
        run: () => void navigate({ to: "/lab", search: { from: focusedId } }),
      },
      {
        id: "action-pin-to-compare",
        label: "Pin to compare",
        section: "Actions",
        icon: Columns2,
        keys: ["pin to compare", "compare", "split"],
        run: () => void navigate({ to: "/compare", search: { a: focusedId, from: focusedId } }),
      },
      downloadThemeJsonCommand(focused),
      {
        id: "action-toggle-next-theme",
        label: "Toggle next theme",
        section: "Actions",
        icon: Shuffle,
        keys: ["toggle next theme", "next", "cycle"],
        run: () => selectTheme(nextThemeId(focusedId)),
      },
    ];

    const palette = usePalette(commands, { seedQuery: railFilter });

    return (
      <>
        <LayoutShell
          expanded={expanded}
          onOpenPalette={palette.open}
          onShowShortcuts={() => setShortcutsOpen(true)}
          palette={palette.paletteProps}
          rail={
            <Rail
              focusedThemeId={focused.theme.id}
              pinnedThemeIds={EMPTY_PINNED}
              onSelect={selectTheme}
              onFilterChange={setRailFilter}
            />
          }
          pane={
            <Pane
              entry={focused}
              expanded={expanded}
              onExpandToggle={() => setExpanded((value) => !value)}
              onPin={(themeId) => {
                // Pin to compare enters compare mode with the focused theme as slot a
                // and as the entry-state theme the chrome keeps showing.
                void navigate({ to: "/compare", search: { a: themeId, from: themeId } });
              }}
            />
          }
        />
        <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </>
    );
  },
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: parseCatalogRouteSearch,
});

// <main> wrapper for the not-found route so the global skip link in RootLayout
// always has a target. Migrated routes render their own <main> via LayoutShell.
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
      <CompareRouteView
        search={search}
        onChangeSearch={(nextSearch) => {
          void navigate({ replace: true, search: nextSearch });
        }}
        onExit={(themeId) => {
          void navigate({ to: "/", search: themeId ? { theme: themeId } : {} });
        }}
        onOpenLab={(themeId) => {
          void navigate({ to: "/lab", search: { from: themeId } });
        }}
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
        onBackToCatalog={() => {
          void navigate({ search: {}, to: "/" });
        }}
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
