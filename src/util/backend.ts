import { APPLYTYPE, FANMODE } from "./enum";
import { FanControl } from "./pluginMain";
import { Settings } from "./settings";
import serverAPI from "./serverApi";

export class BackendData {
  private fanMaxRPM = 0;
  private has_fanMaxRPM = false;
  private fanIsAdapted = false;
  public async init() {
    await serverAPI!.callPluginMethod("get_fanMAXRPM", {}).then((res) => {
      if (res.success) {
        this.fanMaxRPM = res.result;
        this.has_fanMaxRPM = true;
      } else {
        this.fanMaxRPM = 1;
      }
    });
    await serverAPI!.callPluginMethod("get_fanIsAdapted", {}).then((res) => {
      if (res.success) {
        this.fanIsAdapted = res.result;
      } else {
        this.fanIsAdapted = false;
      }
    });
  }

  public getFanMAXPRM() {
    return this.fanMaxRPM;
  }

  public HasFanMAXPRM() {
    return this.has_fanMaxRPM;
  }

  public getFanIsAdapt() {
    return this.fanIsAdapted;
  }

  public async getFanRPM() {
    var fanPRM: number;
    await serverAPI!.callPluginMethod("get_fanRPM", {}).then((res) => {
      if (res.success) {
        fanPRM = res.result;
      } else {
        fanPRM = 0;
      }
    });
    return fanPRM!!;
  }

  public async getFanTemp() {
    var fanTemp: number;
    await serverAPI!.callPluginMethod("get_fanTemp", {}).then((res) => {
      if (res.success) {
        fanTemp = res.result / 1000;
      } else {
        fanTemp = -1;
      }
    });
    return fanTemp!!;
  }

  public async getFanIsAuto() {
    var fanIsAuto: boolean;
    await serverAPI!.callPluginMethod("get_fanIsAuto", {}).then((res) => {
      if (res.success) {
        fanIsAuto = res.result;
      } else {
        fanIsAuto = false;
      }
    });
    return fanIsAuto!!;
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
