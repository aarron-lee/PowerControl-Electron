import { useEffect, useRef } from "react";
import { FC } from "react";
import { fanPosition } from "../../util";
export interface FanCanvasProps {
  width: number;
  height: number;
  style: any;
  initDraw?: (canvasRef: any) => void;
  onPointerDown?: (position: any) => void;
  onPointerMove?: (position: any) => void;
  onPointerUp?: (position: any) => void;
  onPointerShortPress?: (position: any) => void;
  onPointerLongPress?: (position: any) => void;
  onPointerDragDown?: (position: any) => boolean;
  onPointerDraging?: (position: any) => void;
}
export const FanCanvas: FC<FanCanvasProps> = (canvas) => {
  const pointerDownPos: any = useRef(null);
  const pointerDownTime: any = useRef(null);
  const pointerUpPos: any = useRef(null);
  const pointerUpTime: any = useRef(null);
  const pointerIsDrag = useRef(false);
  const canvasRef: any = useRef(null);
  useEffect(() => {
    if (canvas && canvas.initDraw) canvas.initDraw(canvasRef.current);
  }, []);

  // function getMousePos(canvas, evt) {
  //   var rect = canvas.getBoundingClientRect();
  //   return {
  //     x: evt.clientX - rect.left,
  //     y: evt.clientY - rect.top
  //   };
  // }

  function onPointerDown(e: any): void {
    const realEvent: any = e.nativeEvent;
    const fanClickPos = fanPosition.createFanPosByCanPos(
      realEvent.offsetX,
      realEvent.offsetY,
      canvas.width,
      canvas.height
    );
    pointerDownPos.current = [realEvent.offsetX, realEvent.offsetY];
    pointerDownTime.current = Date.parse(new Date().toString());
    if (canvas && canvas.onPointerDown) {
      canvas.onPointerDown(fanClickPos);
    }
    onDragDown(e);
  }
  function onPointerUp(e: any): void {
    const realEvent: any = e.nativeEvent;
    const fanClickPos = fanPosition.createFanPosByCanPos(
      realEvent.offsetX,
      realEvent.offsetY,
      canvas.width,
      canvas.height
    );
    pointerUpPos.current = [realEvent.offsetX, realEvent.offsetY];
    pointerUpTime.current = Date.parse(new Date().toString());
    if (canvas && canvas.onPointerUp) {
      canvas.onPointerUp(fanClickPos);
    }
    //call PointPressEvent
    if (
      approximatelyEqual(
        pointerDownPos.current[0],
        pointerUpPos.current[0],
        3
      ) &&
      approximatelyEqual(pointerDownPos.current[1], pointerUpPos.current[1], 3)
    ) {
      if (pointerUpTime.current - pointerDownTime.current <= 1000)
        onPointerShortPress(e);
      else onPointLongPress(e);
    }
    //console.log(`pressDownTime=${pointerDownTime.current} pressUpTime=${pointerUpTime.current}`)
    if (pointerIsDrag.current) {
      pointerIsDrag.current = false;
    }
  }
  function onPointerMove(e: any): void {
    const realEvent: any = e.nativeEvent;
    const fanClickPos = fanPosition.createFanPosByCanPos(
      realEvent.offsetX,
      realEvent.offsetY,
      canvas.width,
      canvas.height
    );
    canvas.onPointerMove?.call(canvas, fanClickPos);
    if (pointerIsDrag.current) {
      onDraging(e);
    }
  }
  function onPointerLeave(_e: any): void {
    if (pointerIsDrag.current) {
      pointerIsDrag.current = false;
    }
  }
  function onPointerShortPress(e: any): void {
    const realEvent: any = e.nativeEvent;
    const fanClickPos = fanPosition.createFanPosByCanPos(
      realEvent.offsetX,
      realEvent.offsetY,
      canvas.width,
      canvas.height
    );
    if (canvas && canvas.onPointerShortPress)
      canvas.onPointerShortPress(fanClickPos);
  }
  //@ts-ignore
  function onPointLongPress(e: any): void {}
  function onDragDown(e: any): void {
    const realEvent: any = e.nativeEvent;
    const fanClickPos = fanPosition.createFanPosByCanPos(
      realEvent.offsetX,
      realEvent.offsetY,
      canvas.width,
      canvas.height
    );
    if (canvas && canvas.onPointerDragDown) {
      pointerIsDrag.current = canvas.onPointerDragDown(fanClickPos);
    }
  }
  function onDraging(e: any): void {
    const realEvent: any = e.nativeEvent;
    const fanClickPos = fanPosition.createFanPosByCanPos(
      realEvent.offsetX,
      realEvent.offsetY,
      canvas.width,
      canvas.height
    );
    if (canvas && canvas.onPointerDraging) {
      canvas.onPointerDraging(fanClickPos);
    }
  }
  const { width, height, style } = canvas;
  return (
    <canvas
      ref={canvasRef}
      //onClick={(e: any) => onClickCanvas(e)}
      onPointerDown={(e: any) => {
        onPointerDown(e);
      }}
      onPointerMove={(e: any) => {
        onPointerMove(e);
      }}
      onPointerUp={(e: any) => {
        onPointerUp(e);
      }}
      onPointerLeave={(e: any) => {
        onPointerLeave(e);
      }}
      width={width}
      height={height}
      style={style}
    />
  );
};

const approximatelyEqual = (a: number, b: number, error: number) => {
  return Math.abs(b - a) <= error;
};
