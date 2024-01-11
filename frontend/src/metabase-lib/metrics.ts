import * as ML from "cljs/metabase.lib.js";
import type { MetricId } from "metabase-types/api";

import type { MetricMetadata, Query } from "./types";

export function availableMetrics(query: Query): MetricMetadata[] {
  return ML.available_metrics(query);
}

export function metric(
  query: Query,
  metricId: MetricId,
): MetricMetadata | null {
  return ML.metric(query, metricId);
}
