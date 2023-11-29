import { createOrdersTotalDatasetColumn } from "metabase-types/api/mocks/presets";
import * as Lib from "metabase-lib";
import {
  createQuery,
  createRawCellClickObject,
  findDrillThru,
  queryDrillThru,
} from "metabase-lib/test-helpers";
import { createAggregatedQuery, createCountColumn } from "./drills-common";

describe("drill-thru/pivot", () => {
  const drillType = "drill-thru/pivot";
  const stageIndex = 0;

  describe("raw query", () => {
    const query = createQuery();
    const clickObject = createRawCellClickObject({
      column: createOrdersTotalDatasetColumn(),
      value: 10,
    });

    it("should not allow to drill a raw query", () => {
      const drill = queryDrillThru(query, stageIndex, clickObject, drillType);
      expect(drill).toBeNull();
    });
  });

  describe("1 aggregation", () => {
    const query = createAggregatedQuery({ aggregationOperatorName: "count" });
    const column = createCountColumn();
    const clickObject = createRawCellClickObject({ column, value: 10 });

    it("should make pivot drill available", () => {
      const { drillInfo } = findDrillThru(
        query,
        stageIndex,
        clickObject,
        drillType,
      );
      expect(drillInfo).toMatchObject({
        type: drillType,
      });
    });

    it("should make all pivot types available", () => {
      const { drill } = findDrillThru(
        query,
        stageIndex,
        clickObject,
        drillType,
      );
      const pivotTypes = Lib.pivotTypes(drill);
      expect(pivotTypes).toEqual(["category", "location", "time"]);
    });

    it.each<[Lib.PivotType, number]>([["category", 5]])(
      'should drill with a "%s" column',
      (pivotType, columnCount) => {
        const { drill } = findDrillThru(
          query,
          stageIndex,
          clickObject,
          drillType,
        );

        const columns = Lib.pivotColumnsForType(drill, pivotType);
        expect(columns).toHaveLength(columnCount);

        columns.forEach(column => {
          const newQuery = Lib.drillThru(query, stageIndex, drill, column);
          expect(Lib.aggregations(newQuery, stageIndex)).toHaveLength(1);
          expect(Lib.breakouts(newQuery, stageIndex)).toHaveLength(1);
        });
      },
    );
  });
});
