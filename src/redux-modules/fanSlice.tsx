import { createSlice } from "@reduxjs/toolkit";

type FanState = {
  enabled: boolean;
  fanSettings: { [name: string]: any };
};

const initialState: FanState = {
  enabled: false,
  fanSettings: {},
};

export const fanSlice = createSlice({
  name: "fan",
  initialState,
  reducers: {},
  extraReducers: (builder) => {},
});
