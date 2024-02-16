import { t } from "ttag";

import * as Lib from "metabase-lib";

import type {
  QueryColumnInfoPopoverProps,
  TableColumnInfoPopoverProps,
} from "../ColumnInfoPopover";
import {
  QueryColumnInfoPopover,
  TableColumnInfoPopover,
} from "../ColumnInfoPopover";

import { PopoverHoverTarget, HoverParent } from "./ColumnInfoIcon.styled";
export { HoverParent };

export function QueryColumnInfoIcon({
  className,
  delay = [0, 150],
  ...props
}: QueryColumnInfoPopoverProps) {
  const { query, stageIndex, column } = props;
  const { description = "" } = query
    ? Lib.displayInfo(query, stageIndex, column)
    : {};

  return (
    <QueryColumnInfoPopover {...props} delay={delay}>
      <PopoverHoverTarget
        className={className}
        name="info_filled"
        hasDescription={Boolean(description)}
        aria-label={t`More info`}
      />
    </QueryColumnInfoPopover>
  );
}

QueryColumnInfoIcon.HoverParent = HoverParent;

export function TableColumnInfoIcon({
  className,
  delay = [0, 150],
  field,
  ...props
}: TableColumnInfoPopoverProps) {
  return (
    <TableColumnInfoPopover {...props} field={field} delay={delay}>
      <PopoverHoverTarget
        className={className}
        name="info_filled"
        hasDescription={Boolean(field.description)}
        aria-label={t`More info`}
      />
    </TableColumnInfoPopover>
  );
}

TableColumnInfoIcon.HoverParent = HoverParent;
