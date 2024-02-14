import { createSelector } from "@reduxjs/toolkit";
import type { Selector } from "@reduxjs/toolkit";
import type { State } from "metabase-types/store";
import type { PaletteAction } from "metabase/palette/hooks/useCommandPalette";

// TODO: Not sure the default value makes sense here
export const getPalette = (state: State) => state.palette || {};

export const getContextualPaletteActions: Selector<State, PaletteAction[]> =
  createSelector([getPalette], palette => palette?.contextualActions || []);

export const getPaletteQuery: Selector<State, string> = createSelector(
  [getPalette],
  palette => palette.query,
);
