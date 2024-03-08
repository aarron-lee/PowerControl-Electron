import { fanSlice } from "./redux-modules/fanSlice";
import { store } from "./redux-modules/store";
import { serverAPI } from "./util/serverApi";

let powerControlListenerId: number | undefined;

export const powerControlPluginListener = () => {
  fetchData();

  powerControlListenerId = window.setInterval(async () => {
    fetchData();
  }, 3000);

  return () => {
    if (powerControlListenerId) {
      clearInterval(powerControlListenerId);
    }
  };
};

async function fetchData() {
  await getFanRPM();
  await getFanTemp();
  await getFanIsAuto();
}

async function getFanRPM() {
  const response = await serverAPI.callPluginMethod("get_fanRPM", {});

  const { success, result } = response;

  if (success && typeof result === "number") {
    store.dispatch(fanSlice.actions.setCurrentRpm(result));
  }
}

async function getFanTemp() {
  const response = await serverAPI.callPluginMethod("get_fanTemp", {});

  const { success, result } = response;

  let fanTemp = -1;

  if (success && typeof result === "number") {
    fanTemp = result / 1000;
  }

  store.dispatch(fanSlice.actions.setCurrentFanTemp(fanTemp));
}

async function getFanIsAuto() {
  const response = await serverAPI.callPluginMethod("get_fanIsAuto", {});

  const { success, result } = response;

  let fanIsAuto = false;

  if (success) {
    fanIsAuto = Boolean(result);
  }

  store.dispatch(fanSlice.actions.setFanIsAuto(fanIsAuto));
}
