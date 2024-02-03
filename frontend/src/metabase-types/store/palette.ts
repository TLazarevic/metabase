import type { CommandPaletteAction } from "metabase/palette/hooks/useCommandPalette";

export interface PaletteState {
  query: string;
  contextualActions: CommandPaletteAction[];
}
