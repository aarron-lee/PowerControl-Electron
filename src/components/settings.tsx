import { FC } from "react";
import { localizeStrEnum, localizationManager } from "../i18n";
import Toggle from "./ui/Toggle";
import { useSelector } from "react-redux";
import { fanSlice, selectFanEnabled } from "../redux-modules/fanSlice";
import { useAppDispatch } from "../redux-modules/store";

export const SettingsComponent: FC = () => {
  const enabled = useSelector(selectFanEnabled);
  const dispatch = useAppDispatch();

  return (
    <Toggle
      label={localizationManager.getString(localizeStrEnum.ENABLE_SETTINGS)}
      checked={enabled}
      onChange={(enabled: boolean) => {
        dispatch(fanSlice.actions.setEnabled(enabled));
      }}
    />
  );
};
