import { useEffect, useState, FC } from "react";
import { Settings, PluginManager, ComponentName, UpdateType } from "../util";
import { localizeStrEnum, localizationManager } from "../i18n";
import Toggle from "./Toggle";

const SettingsEnableComponent: FC = () => {
  const [enable, setEnable] = useState<boolean>(Settings.ensureEnable());
  const refresh = () => {
    setEnable(Settings.ensureEnable());
  };
  //listen Settings
  useEffect(() => {
    if (!enable) {
      PluginManager.updateAllComponent(UpdateType.HIDE);
    } else {
      PluginManager.updateAllComponent(UpdateType.SHOW);
    }
    PluginManager.listenUpdateComponent(
      ComponentName.SET_ENABLE,
      [ComponentName.SET_ENABLE],
      (_ComponentName, updateType) => {
        switch (updateType) {
          case UpdateType.UPDATE: {
            refresh();
            break;
          }
        }
      }
    );
  }, []);
  return (
    <div>
      <Toggle
        label={localizationManager.getString(localizeStrEnum.ENABLE_SETTINGS)}
        checked={enable}
        onChange={(enabled: boolean) => {
          Settings.setEnable(enabled);
        }}
      />
    </div>
  );
};

export const SettingsComponent: FC = () => {
  return (
    <div>
      <SettingsEnableComponent />
    </div>
  );
};
