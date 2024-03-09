import { useReducer } from "react";

type ActionPayloadType = {
  type: ActionType;
  payload: any;
};

type ActionType =
  | "SET_DRAG_POINT"
  | "SET_DRAG_SELECTED_POINTS"
  | "SET_SELECTED_POINT";

type FanCurveState = {
  currentDragPoint: any;
  selectedDragPoint: any;
};

const reducer = (state: FanCurveState, action: ActionPayloadType) => {
  let newState: { [key: string]: any } = {};
  const { type, payload } = action;

  if (type === "SET_DRAG_POINT") {
    newState["currentDragPoint"] = payload;
  } else if (type === "SET_SELECTED_POINT") {
    newState["selectedDragPoint"] = payload;
  } else if (type === "SET_DRAG_SELECTED_POINTS") {
    const { dragPoint, selectedPoint } = payload;
    newState["currentDragPoint"] = dragPoint;
    newState["selectedDragPoint"] = selectedPoint;
  }

  return { ...state, ...newState };
};

const initialFanState: FanCurveState = {
  currentDragPoint: {},
  selectedDragPoint: {},
};

export const useFanCurveReducer = () => {
  const [state, dispatch] = useReducer(reducer, initialFanState);

  const setCurrentDragPoint = (dragPoint: any) => {
    dispatch({ type: "SET_DRAG_POINT", payload: dragPoint });
  };

  const setSelectedPoint = (selectedPoint: any) => {
    dispatch({ type: "SET_SELECTED_POINT", payload: selectedPoint });
  };

  const setCurrentDragPointAndSelectedPoint = ({
    dragPoint,
    selectedPoint,
  }: {
    dragPoint: any;
    selectedPoint: any;
  }) => {
    dispatch({
      type: "SET_DRAG_SELECTED_POINTS",
      payload: {
        dragPoint,
        selectedPoint,
      },
    });
  };

  return {
    fanCurveState: state,
    setCurrentDragPoint,
    setSelectedPoint,
    setCurrentDragPointAndSelectedPoint,
  };
};
