/* eslint-disable react/prop-types */
import { t } from "ttag";
import { duration } from "metabase/lib/formatting";

import Tooltip from "metabase/core/components/Tooltip";
import RunButton from "./RunButton";

const REFRESH_TOOLTIP_THRESHOLD = 30 * 1000; // 30 seconds

const defaultGetTooltip = ({ isDirty, result }) => {
  const { cached, average_execution_time } = result || {};
  return !isDirty &&
    cached &&
    average_execution_time > REFRESH_TOOLTIP_THRESHOLD
    ? t`This question will take approximately ${duration(
        average_execution_time,
      )} to refresh`
    : null;
};

export default function RunButtonWithTooltip({
  getTooltip = defaultGetTooltip,
  ...props
}) {
  const label = getTooltip(props);
  return (
    <Tooltip tooltip={label} placement="top">
      <RunButton {...props} data-palette-name={label} />
    </Tooltip>
  );
}
