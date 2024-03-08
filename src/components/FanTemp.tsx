import { FC } from "react";
import { useSelector } from "react-redux";
import { selectCurrentTemp } from "../redux-modules/fanSlice";

const FanTemp: FC = () => {
  const currentTemp = useSelector(selectCurrentTemp);
  return <div id={"fan-currentTemp"}>{currentTemp + " C"}</div>;
};

export default FanTemp;
