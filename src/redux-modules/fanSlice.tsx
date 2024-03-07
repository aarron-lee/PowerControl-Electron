import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { SETTINGS_KEY } from "./constants";

type FanState = {
  enabled: boolean;
  currentRpm: number;
  fanSettings: { [name: string]: any };
};

const initialState: FanState = {
  enabled: true,
  currentRpm: 0,
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
  },
  extraReducers: (builder) => {},
});

export const selectFanEnabled = (store: RootState) => {
  return store.fan.enabled;
};

export const selectCurrentRpm = (store: RootState) => {
  return store.fan.currentRpm;
};
