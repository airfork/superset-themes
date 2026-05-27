import type { PreviewTabId } from "../preview/PreviewTabs";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

export type PairSlotId = "dark" | "light";

export interface PairingState {
  darkThemeId?: string;
  lightThemeId?: string;
  selectedPreviewTab: PreviewTabId;
}

export type PairingPinResult =
  | {
      ok: true;
      state: PairingState;
    }
  | {
      ok: false;
      reason: string;
      state: PairingState;
    };

export const DEFAULT_PAIRING_STATE: PairingState = {
  selectedPreviewTab: "workspace",
};

export function pinPairTheme(
  state: PairingState,
  entry: CatalogThemeEntry,
  slot: PairSlotId,
): PairingPinResult {
  if (entry.theme.type !== slot) {
    return {
      ok: false,
      reason: `Theme ${entry.theme.id} is ${entry.theme.type} and cannot be pinned to the ${slot} slot.`,
      state,
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      [slot === "light" ? "lightThemeId" : "darkThemeId"]: entry.theme.id,
    },
  };
}

export function clearPairSlot(state: PairingState, slot: PairSlotId): PairingState {
  if (slot === "light") {
    const { lightThemeId: _lightThemeId, ...nextState } = state;

    return nextState;
  }

  const { darkThemeId: _darkThemeId, ...nextState } = state;

  return nextState;
}

export function setPairPreviewTab(
  state: PairingState,
  selectedPreviewTab: PreviewTabId,
): PairingState {
  return {
    ...state,
    selectedPreviewTab,
  };
}
