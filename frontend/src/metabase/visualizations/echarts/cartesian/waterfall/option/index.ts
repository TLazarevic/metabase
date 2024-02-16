import type { EChartsOption } from "echarts";
import type { DatasetOption } from "echarts/types/dist/shared";

import type {
  ComputedVisualizationSettings,
  RenderingContext,
} from "metabase/visualizations/types";
import type { TimelineEventId } from "metabase-types/api";

import { getCartesianChartOption } from "../../option";
import type { WaterfallChartModel } from "../types";
import { DATASET_DIMENSIONS } from "../constants";
import type { TimelineEventsModel } from "../../timeline-events/types";
import type { ChartMeasurements } from "../../model/types";
import { getAxes } from "./axis";

export function getWaterfallOption(
  chartModel: WaterfallChartModel,
  chartMeasurements: ChartMeasurements,
  timelineEventsModel: TimelineEventsModel | null,
  selectedTimelineEventsIds: TimelineEventId[],
  settings: ComputedVisualizationSettings,
  chartWidth: number,
  renderingContext: RenderingContext,
): EChartsOption {
  const baseOption = getCartesianChartOption(
    chartModel,
    chartMeasurements,
    timelineEventsModel,
    selectedTimelineEventsIds,
    settings,
    chartWidth,
    renderingContext,
  );

  const dataset: DatasetOption = {
    source: chartModel.waterfallDataset,
    dimensions: Object.values(DATASET_DIMENSIONS),
  };

  return {
    ...baseOption,
    dataset,
    ...getAxes(
      settings,
      chartModel,
      chartMeasurements,
      baseOption,
      renderingContext,
    ),
  };
}
