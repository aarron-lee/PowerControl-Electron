import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { SETTINGS_KEY } from "./constants";
import { get } from "lodash";

export type FanCurvePoint = {
  temperature: number;
  fanRPMpercent: number;
};

export type FanProfile = {
  snapToGrid: boolean;
  fanMode: number;
  fixSpeed: number;
  curvePoints: FanCurvePoint[];
};

type FanState = {
  enabled: boolean;
  fanIsAuto: boolean;
  currentTemp?: number;
  fanMaxRpm: number;
  fanIsAdapted: boolean;
  currentRpm: number;
  activeFanProfile?: string;
  fanSettings: { [name: string]: FanProfile };
};

const initialState: FanState = {
  enabled: true,
  fanIsAuto: false,
  currentRpm: 0,
  currentTemp: -1,
  fanMaxRpm: 1,
  fanIsAdapted: false,
  fanSettings: {},
};

export const fanSlice = createSlice({
  name: "fan",
  initialState,
  reducers: {
    initialLoad: (state) => {
      const settingsStr = window.localStorage.getItem(SETTINGS_KEY);
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        state.enabled = Boolean(settings.enabled);
        if (settings.fanSettings) {
          state.fanSettings = settings.fanSettings;
        }
        if (settings.activeFanProfile) {
          state.activeFanProfile = settings.activeFanProfile;
        }
      }
    },
    saveSettings: (state) => {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
    },
    setEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
    setCurrentRpm: (state, action: PayloadAction<number>) => {
      state.currentRpm = action.payload;
    },
    setMaxRpm: (state, action: PayloadAction<number>) => {
      state.fanMaxRpm = action.payload;
    },
    setFanIsAdapted: (state, action: PayloadAction<boolean>) => {
      state.fanIsAdapted = action.payload;
    },
    setCurrentFanTemp(state, action: PayloadAction<number>) {
      state.currentTemp = action.payload;
    },
    createOrUpdateFanProfile: (
      state,
      action: PayloadAction<{ name: string; profile: FanProfile }>
    ) => {
      const { name, profile } = action.payload;
      state.fanSettings[name] = profile;
      state.activeFanProfile = name;
    },
    setActiveFanProfile(state, action: PayloadAction<string>) {
      const profileName = action.payload;
      if (state.fanSettings[profileName]) {
        state.activeFanProfile = profileName;
      }
    },
    setFanIsAuto(state, action: PayloadAction<boolean>) {
      state.fanIsAuto = action.payload;
    },
  },
  extraReducers: (builder) => {},
});

export const selectFanEnabled = (store: RootState) => {
  return store.fan.enabled;
};

export const selectCurrentRpm = (store: RootState) => {
  return store.fan.currentRpm;
};

export const selectFanIsAuto = (store: RootState) => {
  return store.fan.fanIsAuto;
};

export const selectFanIsAdapted = (store: RootState) => {
  return store.fan.fanIsAdapted;
};

export const selectFanMaxRpm = (store: RootState) => {
  return store.fan.fanMaxRpm;
};

export const selectCurrentTemp = (store: RootState) => {
  return store.fan.currentTemp;
};

export const selectFanProfile = (profileName: string) => (store: RootState) => {
  return get(store, `fan.fanSettings[${profileName}]`, {});
};

export const selectCurvePoints =
  (profileName: string) => (store: RootState) => {
    const fanProfile = selectFanProfile(profileName)(store) as FanProfile;

    return fanProfile?.curvePoints || [];
  };

export const selectActiveProfile = (store: RootState) => {
  const profileName = store.fan.activeFanProfile;

  if (profileName) {
    const fanProfile = selectFanProfile(profileName)(store) as FanProfile;

    return { profileName, fanProfile };
  }
  return {};
};
