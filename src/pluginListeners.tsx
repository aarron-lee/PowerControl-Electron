import { fanSlice } from "./redux-modules/fanSlice";
import { store } from "./redux-modules/store";
import { serverAPI } from "./util/serverApi";

let powerControlListenerId: number | undefined;

export const powerControlPluginListener = () => {
  powerControlListenerId = window.setInterval(async () => {
    const response = await serverAPI.callPluginMethod("get_fanRPM", {});

    const { success, result } = response;

    if (success && typeof result === "number") {
      store.dispatch(fanSlice.actions.setCurrentRpm(result));
    }
  }, 1000);

  return () => {
    if (powerControlListenerId) {
      clearInterval(powerControlListenerId);
    }
  };
};
