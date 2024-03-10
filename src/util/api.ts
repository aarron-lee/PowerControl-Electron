import serverAPI from "./serverApi";

export const setFanIsAuto = (isAuto: boolean) => {
  return serverAPI.callPluginMethod("set_fanAuto", { value: isAuto });
};

export const setFanPercent = (percent: number) => {
  return serverAPI.callPluginMethod("set_fanPercent", { value: percent });
};
