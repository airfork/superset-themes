import { RouterProvider } from "@tanstack/react-router";
import { FocusedThemeProvider } from "../theme/FocusedThemeProvider";
import { router } from "./router";

export function App() {
  return (
    <FocusedThemeProvider>
      <RouterProvider router={router} />
    </FocusedThemeProvider>
  );
}
