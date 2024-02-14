import {
  combineReducers,
  createAction,
  handleActions,
} from "metabase/lib/redux";
import type { PaletteAction } from "metabase/palette/hooks/useCommandPalette";

export const REGISTER_PALETTE_ACTION = "metabase/app/REGISTER_PALETTE_ACTION";
export const UNREGISTER_PALETTE_ACTION =
  "metabase/app/UNREGISTER_PALETTE_ACTION";
export const SET_PALETTE_QUERY = "metabase/app/SET_PALETTE_QUERY";
export const registerPaletteAction = createAction(REGISTER_PALETTE_ACTION);
export const unregisterPaletteAction = createAction(UNREGISTER_PALETTE_ACTION);
export const setPaletteQuery = createAction(SET_PALETTE_QUERY);

const paletteActions = handleActions<string, string>(
  {
    [SET_PALETTE_QUERY]: (_state: string, { payload }: { payload: string }) =>
      payload,
  },
  "",
);

const contextualActions = handleActions<PaletteAction[], PaletteAction>(
  {
    [REGISTER_PALETTE_ACTION]: (
      state: PaletteAction[],
      { payload }: { payload: PaletteAction },
    ) => {
      return [...state, payload];
    },
    [UNREGISTER_PALETTE_ACTION]: (
      state: PaletteAction[],
      { payload }: { payload: PaletteAction },
    ) => state.filter(item => item.id !== payload.id),
  },
  [] as PaletteAction[],
);

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default combineReducers({
  paletteActions,
  contextualActions,
});
