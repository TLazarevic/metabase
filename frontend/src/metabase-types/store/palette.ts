import type { PaletteAction } from "metabase/palette/hooks/useCommandPalette";

export interface PaletteState {
  query: string;
  contextualActions: PaletteAction[];
}
