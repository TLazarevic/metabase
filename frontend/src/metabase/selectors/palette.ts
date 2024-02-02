import { createSelector } from "@reduxjs/toolkit";
import type { Selector } from "@reduxjs/toolkit";
import type { State } from "metabase-types/store";
import type { CommandPaletteAction } from "metabase/palette/hooks/useCommandPalette";

export const getContextualPaletteActions: Selector<
  State,
  CommandPaletteAction[]
> = createSelector(
  [(state: State) => state.palette.contextualActions],
  (contextualPaletteActions: CommandPaletteAction[]) =>
    contextualPaletteActions,
);

export const getPaletteQuery: Selector<State, string> = createSelector(
  [(state: State) => state.palette.query],
  query => query,
);
