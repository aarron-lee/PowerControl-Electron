import { FC, useRef, useEffect, memo } from "react";
import { FanCanvas } from "./fanCanvas";
import { FANMODE } from "../util";
import {
  getTextPosByCanvasPos,
  fanPosition,
  getCurrentTempPosition,
} from "../util/position";
import { useFanCurveReducer } from "./FanCurveCanvas/fanCurveReducer";
import { cloneDeep } from "lodash";

const totalLines = 9;
const lineColor = "#1E90FF";
const pointBlockDis = 5;
const pointColor = "#1A9FFF";
const selectColor = "#FF0000";
const textColor = "#FFFFFF";

type Props = {
  fanMode: number;
  fixSpeed: number;
  snapToGrid: boolean;
  curvePoints: any[];
  currentTemp?: number;
  setCurvePoints: (newCurvePoints: any[]) => void;
  disableDrag?: boolean;
  setFixSpeed: (speed: number) => any;
};

const FanCurveCanvas: FC<Props> = memo(
  ({
    curvePoints,
    fanMode,
    fixSpeed,
    snapToGrid,
    setCurvePoints,
    currentTemp,
    setFixSpeed,
    disableDrag = false,
  }) => {
    const canvasRef: any = useRef(null);

    const {
      fanCurveState,
      setCurrentDragPoint,
      setSelectedPoint,
      setCurrentDragPointAndSelectedPoint,
    } = useFanCurveReducer();

    const selectedPoint = fanCurveState.selectedDragPoint;

    const selPointTemp = selectedPoint?.temperature || 0;
    const selPointSpeed = selectedPoint?.fanRPMpercent || 0;

    const initDraw = (ref: any) => {
      canvasRef.current = ref;
    };

    const refreshCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const width: number = ctx.canvas.width;
      const height: number = ctx.canvas.height;
      const lineDistance = 1 / (totalLines + 1);
      ctx.clearRect(0, 0, width, height);
      //网格绘制
      ctx.beginPath();
      ctx.strokeStyle = "#093455";
      for (let i = 1; i <= totalLines + 1; i++) {
        ctx.moveTo(lineDistance * i * width, 0);
        ctx.lineTo(lineDistance * i * width, height);
        ctx.moveTo(0, lineDistance * i * height);
        ctx.lineTo(width, lineDistance * i * height);
      }
      ctx.stroke();
      //文字绘制
      ctx.beginPath();
      ctx.fillStyle = "#FFFFFF";
      for (let i = 1; i <= totalLines + 1; i++) {
        const tempText = (fanPosition.tempMax / (totalLines + 1)) * i + "°C";
        const fanText = (fanPosition.fanMax / (totalLines + 1)) * i + "%";
        ctx.textAlign = "right";
        ctx.fillText(tempText, lineDistance * i * width - 2, height - 2);
        ctx.textAlign = "left";
        ctx.fillText(fanText, 2, height - lineDistance * i * height + 10);
      }
      ctx.stroke();
      switch (fanMode) {
        case FANMODE.NOCONTROL: {
          break;
        }
        case FANMODE.FIX: {
          drawFixMode();
          break;
        }
        case FANMODE.CURVE: {
          drawCurveMode();
          break;
        }
      }
    };
    const drawFixMode = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const width: number = ctx.canvas.width;
      const height: number = ctx.canvas.height;
      const fp = new fanPosition(fanPosition.tempMax / 2, fixSpeed);
      const anchorPoint = fp.getCanvasPos(width, height);
      var lineStart = [0, anchorPoint[1]];
      var lineEnd = [width, anchorPoint[1]];
      var textPos = getTextPosByCanvasPos(
        anchorPoint[0],
        anchorPoint[1],
        width,
        height
      );
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.fillText(`(${Math.trunc(fixSpeed!!)}%)`, textPos[0], textPos[1]);
      ctx.moveTo(lineStart[0], lineStart[1]);
      ctx.lineTo(lineEnd[0], lineEnd[1]);
      ctx.stroke();
    };
    const drawCurveMode = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const width: number = ctx.canvas.width;
      const height: number = ctx.canvas.height;
      let updatedCurvePoints = curvePoints.sort(
        (a: fanPosition, b: fanPosition) => {
          return a.temperature == b.temperature
            ? a.fanRPMpercent!! - b.fanRPMpercent!!
            : a.temperature!! - b.temperature!!;
        }
      );

      setCurvePoints(updatedCurvePoints);

      if (typeof currentTemp === "number") {
        const currentTempPosition = getCurrentTempPosition(
          currentTemp,
          updatedCurvePoints
        );

        if (currentTempPosition) {
          updatedCurvePoints = cloneDeep(updatedCurvePoints);
          updatedCurvePoints.push(currentTempPosition);

          updatedCurvePoints = updatedCurvePoints.sort(
            (a: fanPosition, b: fanPosition) => {
              return a.temperature == b.temperature
                ? a.fanRPMpercent!! - b.fanRPMpercent!!
                : a.temperature!! - b.temperature!!;
            }
          );
          console.log(updatedCurvePoints);
        }
      }
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.strokeStyle = lineColor;
      for (
        let pointIndex = 0;
        pointIndex < updatedCurvePoints.length;
        pointIndex++
      ) {
        var curvePoint = updatedCurvePoints[pointIndex];
        var pointCanvasPos = curvePoint.getCanvasPos(width, height);
        ctx.lineTo(pointCanvasPos[0], pointCanvasPos[1]);
        ctx.moveTo(pointCanvasPos[0], pointCanvasPos[1]);
      }
      ctx.lineTo(width, 0);
      ctx.stroke();
      for (
        let pointIndex = 0;
        pointIndex < updatedCurvePoints.length;
        pointIndex++
      ) {
        var curvePoint = updatedCurvePoints[pointIndex];
        var pointCanvasPos = curvePoint.getCanvasPos(width, height);
        var textPox = getTextPosByCanvasPos(
          pointCanvasPos[0],
          pointCanvasPos[1],
          width,
          height
        );
        ctx.beginPath();
        ctx.fillStyle =
          curvePoint == selectedPoint || curvePoint.temperature == currentTemp
            ? selectColor
            : pointColor;
        ctx.arc(pointCanvasPos[0], pointCanvasPos[1], 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = textColor;
        ctx.fillText(
          `(${Math.trunc(curvePoint.temperature!!)}°C,${Math.trunc(
            curvePoint.fanRPMpercent!!
          )}%)`,
          textPox[0],
          textPox[1]
        );
        ctx.fill();
      }
    };

    useEffect(() => {
      refreshCanvas();
    }, [snapToGrid, fanMode, fixSpeed, curvePoints, currentTemp]);

    useEffect(() => {
      if (selectedPoint) refreshCanvas();
    }, [selPointSpeed, selPointTemp]);

    function onPointerShortPress(shortPressPos: fanPosition): void {
      switch (fanMode) {
        case FANMODE.NOCONTROL: {
        }
        case FANMODE.FIX: {
          var percent = shortPressPos.fanRPMpercent!!;
          setFixSpeed(percent);
          break;
        }
        case FANMODE.CURVE: {
          var isPressPoint = false;
          //短按时如果按到点 删除该点
          //如果该点是选中点 取消选中
          for (let i = 0; i < curvePoints.length; i++) {
            if (curvePoints[i].isCloseToOther(shortPressPos, pointBlockDis)) {
              if (curvePoints[i] == selectedPoint) {
                setSelectedPoint(null);
                // setSelPointTemp(0);
                // setSelPointSpeed(0);
              }
              curvePoints.splice(i, 1);
              isPressPoint = true;
              break;
            }
          }
          //没有按到点 在该位置生成一个点
          if (!isPressPoint) curvePoints.push(shortPressPos);
          /*
          //选中点时再点击则取消该点,点击其他位置则取消当前选中
          if(selectedPoint.current){
            for(let i=0;i<curvePoints.length;i++){
              if(shortPressPos.isCloseToOther(selectedPoint.current,pointBlockDis)&&curvePoints[i]==selectedPoint.current){
                curvePoints.splice(i,1);
                break;
              }
            }
            selectedPoint.current = null;
            setSelPointTemp(0);
            setSelPointSpeed(0);
          }else{
            //没有选中点时，获取选中的点
            for(let i=0;i<curvePoints.length;i++){
              if(curvePoints[i].isCloseToOther(shortPressPos,pointBlockDis)){
                selectedPoint.current = curvePoints[i];
                setSelPointTemp(selectedPoint.current.temperature);
                setSelPointSpeed(selectedPoint.current.fanRPMpercent);
                break;
              }
            }
            if(!selectedPoint.current){
              curvePoints.push(shortPressPos);
            }
          }*/
          refreshCanvas();
          break;
        }
      }
    }

    function onPointerLongPress(longPressPos: fanPosition): void {
      switch (fanMode) {
        case FANMODE.NOCONTROL: {
          break;
        }
        case FANMODE.FIX: {
          var percent = longPressPos.fanRPMpercent!!;
          setFixSpeed(percent);
          break;
        }
        case FANMODE.CURVE: {
          //长按时按到点 则选中该点
          for (let i = 0; i < curvePoints.length; i++) {
            if (longPressPos.isCloseToOther(curvePoints[i], pointBlockDis)) {
              const currentPoint = curvePoints[i];
              if (currentPoint) {
                setSelectedPoint(
                  new fanPosition(
                    Math.trunc(currentPoint.temperature),
                    Math.trunc(currentPoint.fanRPMpercent)
                  )
                );
              }
              break;
            }
          }
          /*
          //选中点时如果长按该点 则取消选中
          if(selectedPoint.current){
            for(let i=0;i<curvePoints.length;i++){
              if(longPressPos.isCloseToOther(selectedPoint.current,pointBlockDis)&&curvePoints[i]==selectedPoint.current){
                curvePoints.splice(i,1);
                break;
              }
            }
            selectedPoint.current = null;
            setSelPointTemp(0);
            setSelPointSpeed(0);
          }else{
            //没有选中点时，获取选中的点
            for(let i=0;i<curvePoints.length;i++){
              if(curvePoints[i].isCloseToOther(shortPressPos,pointBlockDis)){
                selectedPoint.current = curvePoints[i];
                setSelPointTemp(selectedPoint.current.temperature);
                setSelPointSpeed(selectedPoint.current.fanRPMpercent);
                break;
              }
            }
            if(!selectedPoint.current){
              curvePoints.push(shortPressPos);
            }
          }*/
          refreshCanvas();
          break;
        }
      }
    }
    function onPointerDragDown(dragDownPos: fanPosition): boolean {
      switch (fanMode) {
        case FANMODE.NOCONTROL: {
          return false;
        }
        case FANMODE.FIX: {
          if (Math.abs(dragDownPos.fanRPMpercent!! - fixSpeed) <= 3)
            return true;
        }
        case FANMODE.CURVE:
          {
            for (let i = 0; i < curvePoints.length; i++) {
              if (curvePoints[i].isCloseToOther(dragDownPos, pointBlockDis)) {
                setCurrentDragPoint(curvePoints[i]);
                return true;
              }
            }
          }
          return false;
      }
      return false;
    }
    function onPointerDraging(fanClickPos: fanPosition): void {
      switch (fanMode) {
        case FANMODE.NOCONTROL: {
        }
        case FANMODE.FIX: {
          setFixSpeed(fanClickPos.fanRPMpercent!!);
          break;
        }
        case FANMODE.CURVE: {
          const newDragPoint = new fanPosition(
            fanClickPos.temperature,
            fanClickPos.fanRPMpercent
          );
          const newSelectedPoint = new fanPosition(
            Math.trunc(fanClickPos.temperature),
            Math.trunc(fanClickPos.fanRPMpercent)
          );

          setCurrentDragPointAndSelectedPoint({
            dragPoint: newDragPoint,
            selectedPoint: newSelectedPoint,
          });

          refreshCanvas();
          break;
        }
      }
    }
    return (
      <>
        <div>
          <FanCanvas
            width={300}
            height={300}
            style={{
              width: "300px",
              height: "300px",
              padding: "0px",
              border: "1px solid #1a9fff",
              backgroundColor: "#1a1f2c",
              borderRadius: "4px",
            }}
            //onClick={(e: any) => onClickCanvas(e)}
            onPointerShortPress={(e: fanPosition) => {
              if (disableDrag) return;
              onPointerShortPress(e);
            }}
            onPointerLongPress={(e: fanPosition) => {
              if (disableDrag) return;

              onPointerLongPress(e);
            }}
            onPointerDragDown={(e: fanPosition) => {
              if (disableDrag) return false;

              return onPointerDragDown(e)!!;
            }}
            onPointerDraging={(e: fanPosition) => {
              if (disableDrag) return;

              onPointerDraging(e);
            }}
            initDraw={(f: any) => {
              initDraw(f);
            }}
          />
        </div>
      </>
    );
  }
);
export default FanCurveCanvas;
