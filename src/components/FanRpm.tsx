import { FC } from "react";
import { useSelector } from "react-redux";
import { localizeStrEnum, localizationManager } from "../i18n";
import { selectCurrentRpm } from "../redux-modules/fanSlice";

const FanRpm: FC = () => {
  const fanrpm = useSelector(selectCurrentRpm);
  return (
    <div id={localizationManager.getString(localizeStrEnum.FAN_SPEED)}>
      {fanrpm + " RPM"}
    </div>
  );
};

export default FanRpm;
