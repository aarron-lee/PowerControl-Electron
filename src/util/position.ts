import { FanCurvePoint, selectActiveProfile } from "../redux-modules/fanSlice";
import { cloneDeep } from "lodash";
import { store } from "../redux-modules/store";

export class fanPosition {
  temperature?: number;
  fanRPMpercent?: number;
  isCurrentTemp?: boolean;
  static tempMax: number = 100;
  static fanMax: number = 100;
  static fanMin: number = 0;
  static tempMin: number = 0;
  constructor(
    temperature: number,
    fanRPMpercent: number,
    isCurrentTemp: boolean = false
  ) {
    this.fanRPMpercent = Math.min(
      Math.max(fanRPMpercent, fanPosition.fanMin),
      fanPosition.fanMax
    );
    this.temperature = Math.min(
      Math.max(temperature, fanPosition.tempMin),
      fanPosition.tempMax
    );
    this.isCurrentTemp = isCurrentTemp;
  }
  public getCanvasPos(canWidth: number, canHeight: number) {
    var canPosx = Math.min(
      Math.max((this.temperature!! / fanPosition.tempMax) * canWidth, 0),
      canWidth
    );
    var canPosy = Math.min(
      Math.max((1 - this.fanRPMpercent!! / fanPosition.fanMax) * canHeight, 0),
      canHeight
    );
    return [canPosx, canPosy];
  }
  public isCloseToOther(other: fanPosition, distance: number) {
    var getDis = Math.sqrt(
      Math.pow(other.temperature!! - this.temperature!!, 2) +
        Math.pow(other.fanRPMpercent!! - this.fanRPMpercent!!, 2)
    );
    return getDis <= distance;
  }
  public static createFanPosByCanPos(
    canx: number,
    cany: number,
    canWidth: number,
    canHeight: number
  ) {
    var temperature = Math.min(
      Math.max((canx!! / canWidth) * this.tempMax, this.tempMin),
      this.tempMax
    );
    var fanRPMpercent = Math.min(
      Math.max((1 - cany!! / canHeight) * this.fanMax, this.fanMin),
      this.fanMax
    );
    return new fanPosition(temperature, fanRPMpercent);
  }
}

//通过画布位置来调整文字位置
export const getTextPosByCanvasPos = (
  canPosx: number,
  canPosy: number,
  canWidth: number,
  _canHeight: number
) => {
  var textlen = 55;
  var textheight = 12;
  var offsetX = 0;
  var offsetY = 0;
  if (canPosx + textlen / 2 >= canWidth - 5) {
    offsetX = canWidth - textlen - canPosx;
  } else if (canPosx - textlen / 2 <= 5) {
    offsetX = -canPosx;
  } else {
    offsetX = -textlen / 2 + 2;
  }
  if (canPosy - textheight <= 5) {
    offsetY = textheight + 5;
  } else {
    offsetY = -textheight;
  }
  return [canPosx + offsetX, canPosy + offsetY];
};

export const getCurrentTempPosition = (
  currentTemp: number,
  curvePoints: any[]
) => {
  if (!currentTemp || currentTemp < 0) return;

  if (curvePoints) {
    const pts = cloneDeep(curvePoints);

    pts.push({ temperature: 0, fanRPMpercent: 0 });
    pts.push({ temperature: 100, fanRPMpercent: 100 });

    const sortedPoints = pts.sort((a, b) => {
      return a.temperature == b.temperature
        ? a.fanRPMpercent!! - b.fanRPMpercent!!
        : a.temperature!! - b.temperature!!;
    });

    let lowerBound: FanCurvePoint | undefined;
    let upperBound: FanCurvePoint | undefined;

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      if (
        sortedPoints[i].temperature < currentTemp &&
        sortedPoints[i + 1].temperature > currentTemp
      ) {
        lowerBound = sortedPoints[i];
        upperBound = sortedPoints[i + 1];
        break;
      }
    }

    if (lowerBound && upperBound) {
      const currentTempPoint = calPointInLine(
        lowerBound,
        upperBound,
        currentTemp
      );
      if (currentTempPoint) {
        const [temp, fanRPMpercent] = currentTempPoint;

        return new fanPosition(temp, fanRPMpercent, true);
      }
    }
  }
};

export const calPointInLine = (
  lineStart: FanCurvePoint,
  lineEnd: FanCurvePoint,
  currentTemp: number
) => {
  if (lineStart.temperature!! > lineEnd.temperature!!) return null;
  if (
    currentTemp < lineStart.temperature!! ||
    currentTemp > lineEnd.temperature!!
  )
    return null;
  var deltaY = lineEnd.fanRPMpercent!! - lineStart.fanRPMpercent!!;
  var deltaX = lineEnd.temperature!! - lineStart.temperature!!;
  var calPointY =
    deltaX == 0
      ? deltaY
      : (currentTemp - lineStart.temperature!!) * (deltaY / deltaX) +
        lineStart.fanRPMpercent!!;
  return [currentTemp, calPointY];
};
