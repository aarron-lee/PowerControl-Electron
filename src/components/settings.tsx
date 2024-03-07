import { ToggleField, Marquee } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { Settings, PluginManager, ComponentName, UpdateType } from "../util";
import { localizeStrEnum, localizationManager } from "../i18n";

const SettingsEnableComponent: VFC = () => {
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
      <ToggleField
        label={localizationManager.getString(localizeStrEnum.ENABLE_SETTINGS)}
        checked={enable}
        onChange={(enabled: boolean) => {
          Settings.setEnable(enabled);
        }}
      />
    </div>
  );
};

const SettingsPerAppComponent: VFC = () => {
  const [override, setOverWrite] = useState<boolean>(Settings.appOverWrite());

  const [show, setShow] = useState<boolean>(Settings.ensureEnable());
  const hide = (ishide: boolean) => {
    setShow(!ishide);
  };
  const refresh = () => {
    setOverWrite(Settings.appOverWrite());
  };
  //listen Settings
  useEffect(() => {
    PluginManager.listenUpdateComponent(
      ComponentName.SET_PERAPP,
      [ComponentName.SET_PERAPP],
      (_ComponentName, updateType: string) => {
        switch (updateType) {
          case UpdateType.UPDATE:
            refresh();
            //console.log(`fn:invoke refresh:${updateType} ${UpdateType.UPDATE}`)
            break;
          case UpdateType.SHOW:
            hide(false);
            //console.log(`fn:invoke show:${updateType} ${UpdateType.SHOW}`)
            break;
          case UpdateType.HIDE:
            hide(true);
            //console.log(`fn:invoke hide:${updateType} ${UpdateType.HIDE}`)
            break;
        }
      }
    );
  }, []);
  return (
    <div>
      {show && (
        <ToggleField
          label={localizationManager.getString(
            localizeStrEnum.USE_PERGAME_PROFILE
          )}
          description={
            <div style={{ display: "flex", justifyContent: "left" }}>
              <div style={{ lineHeight: "20px", whiteSpace: "pre" }}>
                {localizationManager.getString(localizeStrEnum.USING) +
                  (override ? "『" : "")}
              </div>
              <Marquee
                play={true}
                fadeLength={10}
                delay={1}
                style={{
                  maxWidth: "100px",
                  lineHeight: "20px",
                  whiteSpace: "pre",
                }}
              >
                {`${localizationManager.getString(localizeStrEnum.DEFAULT)}`}
              </Marquee>
              <div style={{ lineHeight: "20px", whiteSpace: "pre" }}>
                {(override ? "』" : "") +
                  localizationManager.getString(localizeStrEnum.PROFILE)}
              </div>
            </div>
          }
          checked={override}
          onChange={(override: boolean) => {
            Settings.setOverWrite(override);
          }}
        />
      )}
    </div>
  );
};

export const SettingsComponent: VFC = () => {
  return (
    <div>
      <SettingsEnableComponent />
      <SettingsPerAppComponent />
    </div>
  );
};
