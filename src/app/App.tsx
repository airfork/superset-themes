import { RouterProvider } from "@tanstack/react-router";
import { FocusedThemeProvider } from "../theme/FocusedThemeProvider";
import { router } from "./router";

export function App() {
  // The inline first-paint script writes data-theme-id before React mounts; seed
  // the provider from it so the first render matches what is already on screen.
  const initialThemeId =
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("data-theme-id") ?? undefined)
      : undefined;

  return (
    <FocusedThemeProvider initialThemeId={initialThemeId}>
      <RouterProvider router={router} />
    </FocusedThemeProvider>
  );
}
