import { uuid } from "metabase/lib/utils";
import { Icon } from "metabase/ui";
import type { IconName } from "metabase/ui";
import type { PaletteOptions } from "./hooks/useContextualPaletteAction";

export const createPaletteAction = ({
  label,
  icon = "click",
  onClick,
}: PaletteOptions) => ({
  id: uuid(),
  label,
  // TODO: Remove this 'as'
  icon:
    typeof icon === "string" ? <Icon name={icon as IconName} /> : <>{icon}</>,
  onClick,
});
