import { isEqual } from "lodash";
import { fanPosition } from "../../util";
import { FanCurvePoint } from "../../redux-modules/fanSlice";
import { useMemo } from "react";

let previousCurvePoints: FanCurvePoint[] | undefined;

let fanPositions: fanPosition[] | undefined;

export const useMemoizeCurvePoints = (cpoints: any[]) => {
  const curvePoints = useMemo(() => {
    if (!isEqual(cpoints, previousCurvePoints)) {
      fanPositions = cpoints.map((p) => {
        if (!(p instanceof fanPosition)) {
          return new fanPosition(p.temperature, p.fanRPMpercent);
        }
        return p;
      });
    }
    previousCurvePoints = cpoints;
    return fanPositions;
  }, [cpoints]);

  return curvePoints;
};
