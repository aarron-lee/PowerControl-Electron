import { SETTINGS_KEY } from "./constants";
import { fanSlice } from "./fanSlice";

const MUTATING_ACTION_TYPES = [
  fanSlice.actions.setEnabled.type,
  fanSlice.actions.createOrUpdateFanProfile.type,
];

const saveToLocalStorage = (state: any) => {
  const { fan } = state;

  if (fan) {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(fan));
  }
};

export const saveFanSettingsMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    const state = store.getState();

    if (MUTATING_ACTION_TYPES.includes(action.type)) {
      saveToLocalStorage(state);
    }
  };
