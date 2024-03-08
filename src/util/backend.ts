import { APPLYTYPE, FANMODE } from "./enum";
import { FanControl } from "./pluginMain";
import { Settings } from "./settings";
import serverAPI from "./serverApi";
import { store } from "../redux-modules/store";
import {
  fanSlice,
  selectCurrentRpm,
  selectCurrentTemp,
  selectFanIsAdapted,
  selectFanIsAuto,
  selectFanMaxRpm,
} from "../redux-modules/fanSlice";

export class BackendData {
  private fanMaxRPM = 0;
  private has_fanMaxRPM = false;
  private fanIsAdapted = false;
  public async init() {
    const r = await serverAPI.callPluginMethod("get_fanMAXRPM");
    let fanMaxRpm = 1;
    if (r && r.success) {
      fanMaxRpm = r.result;
      this.fanMaxRPM = fanMaxRpm;
      this.has_fanMaxRPM = true;
    }
    store.dispatch(fanSlice.actions.setMaxRpm(fanMaxRpm));

    const res = await serverAPI.callPluginMethod("get_fanIsAdapted");
    let fanIsAdapted = false;
    if (res && res.success) {
      fanIsAdapted = res.result;
      this.fanIsAdapted = fanIsAdapted;
    }
    store.dispatch(fanSlice.actions.setFanIsAdapted(fanIsAdapted));
  }

  public getFanMAXPRM() {
    const fanMaxRPM = selectFanMaxRpm(store.getState());

    return fanMaxRPM;
  }

  public HasFanMAXPRM() {
    return this.has_fanMaxRPM;
  }

  public getFanIsAdapt() {
    const fanIsAdapted = selectFanIsAdapted(store.getState());
    return fanIsAdapted;
  }

  public async getFanRPM() {
    const fanRpm = selectCurrentRpm(store.getState());

    return fanRpm;
  }

  public async getFanTemp() {
    const currentTemp = selectCurrentTemp(store.getState());
    return currentTemp;
  }

  public async getFanIsAuto() {
    const fanIsAuto = selectFanIsAuto(store.getState());
    return fanIsAuto;
  }
}

export class Backend {
  public static data: BackendData;
  public static async init() {
    this.data = new BackendData();
    await this.data.init();
  }

  private static applyFanAuto(auto: boolean) {
    serverAPI!.callPluginMethod("set_fanAuto", { value: auto });
  }
  private static applyFanPercent(percent: number) {
    serverAPI!.callPluginMethod("set_fanPercent", { value: percent });
  }
  public static throwSuspendEvt() {
    console.log("throwSuspendEvt");
    serverAPI!.callPluginMethod("receive_suspendEvent", {});
  }

  public static applySettings = (applyTarget: string) => {
    if (!Settings.ensureEnable()) {
      Backend.resetSettings();
      return;
    }

    if (
      applyTarget == APPLYTYPE.SET_ALL ||
      applyTarget == APPLYTYPE.SET_FANMODE
    ) {
      if (!FanControl.fanIsEnable) {
        return;
      }
      const fanSetting = Settings.appFanSetting();
      const fanMode = fanSetting?.fanMode;
      if (fanMode == FANMODE.NOCONTROL) {
        Backend.applyFanAuto(true);
      } else if (fanMode == FANMODE.FIX) {
        Backend.applyFanAuto(false);
      } else if (fanMode == FANMODE.CURVE) {
        Backend.applyFanAuto(false);
      } else {
        Backend.applyFanAuto(true);
        console.log(`出现意外的FanMode = ${fanMode}`);
      }
    }
    if (
      applyTarget == APPLYTYPE.SET_ALL ||
      applyTarget == APPLYTYPE.SET_FANRPM
    ) {
      if (!FanControl.fanIsEnable) {
        return;
      }
      const fanSetting = Settings.appFanSetting();
      const fanMode = fanSetting?.fanMode;
      if (fanMode == FANMODE.NOCONTROL) {
      } else if (fanMode == FANMODE.FIX) {
        Backend.applyFanPercent(FanControl.setPoint.fanRPMpercent!!);
      } else if (fanMode == FANMODE.CURVE) {
        Backend.applyFanPercent(FanControl.setPoint.fanRPMpercent!!);
      } else {
        console.log(`出现意外的FanMode = ${fanMode}`);
      }
    }
  };

  public static resetFanSettings = () => {
    Backend.applyFanAuto(true);
  };

  public static resetSettings = () => {
    console.log("重置所有设置");
    Backend.applyFanAuto(true);
  };
}
