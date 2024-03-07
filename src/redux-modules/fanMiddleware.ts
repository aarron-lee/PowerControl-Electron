import { SETTINGS_KEY } from "./constants";

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
    saveToLocalStorage(state);
  };
