import {
  fanSlice,
  selectActiveProfile,
  selectFanEnabled,
  selectFanIsAuto,
} from "./redux-modules/fanSlice";
import { store } from "./redux-modules/store";
import { FANMODE, getCurrentTempPosition } from "./util";
import { setFanIsAuto, setFanPercent } from "./util/api";
import { serverAPI } from "./util/serverApi";

let powerControlListenerId: number | undefined;

export const powerControlPluginListener = () => {
  fetchData();

  powerControlListenerId = window.setInterval(async () => {
    fetchData();
  }, 2000);

  return () => {
    if (powerControlListenerId) {
      clearInterval(powerControlListenerId);
    }
  };
};

async function fetchData() {
  try {
    await getFanRPM();
    await getFanIsAuto();
    await getFanTemp();
  } catch (e) {
    console.error(e);
  }
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

  setFanPercentForTemp(fanTemp);

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

async function setFanPercentForTemp(currentTemp: number) {
  const state = store.getState();

  const { profileName, fanProfile } = selectActiveProfile(state);
  const fanControlEnabled = selectFanEnabled(state);
  const fanIsAuto = selectFanIsAuto(state);

  if (!fanControlEnabled && !fanIsAuto) {
    return setFanIsAuto(true);
  } else if (fanControlEnabled && fanIsAuto) {
    setFanIsAuto(false);
  }

  if (fanIsAuto) {
    return;
  }

  if (fanProfile) {
    const { fanMode, fixSpeed, curvePoints } = fanProfile;

    if (fanMode === FANMODE.FIX) {
      setFanPercent(fixSpeed);
    } else if (fanMode === FANMODE.CURVE) {
      const fanPosForTemp = getCurrentTempPosition(currentTemp, curvePoints);
      if (fanPosForTemp) {
        const { fanRPMpercent } = fanPosForTemp;
        if (typeof fanRPMpercent === "number") {
          setFanPercent(fanRPMpercent);
        }
      }
    } else if (fanMode === FANMODE.NOCONTROL) {
      // set isAuto to true
      setFanIsAuto(true);
    }
    return;
  }

  // no fan profile, set isAuto
  setFanIsAuto(true);
}
