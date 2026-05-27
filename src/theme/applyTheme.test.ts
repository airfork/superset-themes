// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { getDefaultFocusedTheme } from "../data/featured";
import { applyTheme } from "./applyTheme";

describe("applyTheme", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme-type");
    document.documentElement.removeAttribute("data-theme-id");
  });

  it("writes ui + terminal vars to :root and sets data attributes", () => {
    const entry = getDefaultFocusedTheme();
    applyTheme(entry.theme);

    const root = document.documentElement;
    expect(root.style.getPropertyValue("--preview-ui-background")).toBe(entry.theme.ui.background);
    expect(root.style.getPropertyValue("--preview-ui-foreground")).toBe(entry.theme.ui.foreground);
    expect(root.style.getPropertyValue("--preview-terminal-background")).toBe(
      entry.theme.terminal.background,
    );
    expect(root.getAttribute("data-theme-type")).toBe(entry.theme.type);
    expect(root.getAttribute("data-theme-id")).toBe(entry.theme.id);
  });

  it("targets a custom root element when provided", () => {
    const scope = document.createElement("div");
    document.body.appendChild(scope);
    const entry = getDefaultFocusedTheme();

    applyTheme(entry.theme, scope);

    expect(scope.style.getPropertyValue("--preview-ui-background")).toBe(entry.theme.ui.background);
    expect(scope.getAttribute("data-theme-id")).toBe(entry.theme.id);
    expect(document.documentElement.style.getPropertyValue("--preview-ui-background")).toBe("");

    scope.remove();
  });
});
