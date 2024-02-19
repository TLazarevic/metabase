export interface Padding {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface TicksDimensions {
  yTicksWidthLeft: number;
  yTicksWidthRight: number;
  xTicksHeight: number;
  xTicksWidth: number;
}

export interface ChartMeasurements {
  padding: Padding;
  ticksDimensions: TicksDimensions;
  boundaryWidth: number;
}
