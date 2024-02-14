import type { ReactFragment, ReactNode, Ref } from "react";
import { useEffect } from "react";
import { useDispatch } from "metabase/lib/redux";
import {
  registerPaletteAction,
  unregisterPaletteAction,
} from "metabase/redux/palette";
import type { IconName } from "metabase/ui";
import { createPaletteAction } from "../utils";

export type PaletteOptions = {
  icon?: ReactNode | IconName;
  label?: ReactNode;
  onClick?: () => void;
};

export const useContextualPaletteAction = (
  palette: boolean | PaletteOptions = false,
  label: ReactNode | undefined,
  icon: ReactNode,
  ref: Ref<HTMLButtonElement | HTMLLinkElement>,
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!palette) {
      return;
    }
    if (typeof palette == "object") {
      label ??= palette.label;
    }

    const onClick = () => {
      // Function refs not currently supported for this purpose
      if (typeof ref === "function") {
        return;
      }
      ref?.current?.click();
    };
    const paletteAction = createPaletteAction({ label, icon, onClick });

    dispatch(registerPaletteAction(paletteAction));
    return () => {
      dispatch(unregisterPaletteAction(paletteAction));
    };
  }, [dispatch, palette, label, icon, ref]);
};
