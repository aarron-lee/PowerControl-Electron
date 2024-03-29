import { configureStore } from "@reduxjs/toolkit";
import { fanSlice } from "./fanSlice";
import { useDispatch } from "react-redux";
import { saveFanSettingsMiddleware } from "./fanMiddleware";
// import { logger } from "./logger";

export const store = configureStore({
  reducer: {
    fan: fanSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat([
      saveFanSettingsMiddleware,
      // logger
    ]),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => {
  const dispatch = useDispatch<AppDispatch>();
  return dispatch;
};
