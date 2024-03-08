/*!
 * Copyright (C) 2022 Sefa Eyeoglu <contact@scrumplex.net> (https://scrumplex.net)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import { PluginManager } from "./util";
import { SettingsComponent, FANComponent } from "./components";
import { AppDispatch } from "./redux-modules/store";
import { fanSlice } from "./redux-modules/fanSlice";
import { powerControlPluginListener } from "./pluginListeners";
import serverAPI from "./util/serverApi";

const Content: FC<{}> = ({}) => {
  useAppInitialize();

  return (
    <div>
      {PluginManager.isIniting() && "Loading"}
      {!PluginManager.isIniting() && (
        <div>
          <SettingsComponent />
          <FANComponent />
        </div>
      )}
    </div>
  );
};

function useAppInitialize() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fanSlice.actions.initialLoad());
    const unsubscribe = powerControlPluginListener();

    initialFetch(dispatch);

    return () => {
      unsubscribe();
    };
  }, []);
}

async function initialFetch(dispatch: AppDispatch) {
  const r = await serverAPI.callPluginMethod("get_fanMAXRPM");
  let fanMaxRpm = 1;
  if (r && r.success) {
    fanMaxRpm = r.result;
  }
  dispatch(fanSlice.actions.setMaxRpm(fanMaxRpm));

  const res = await serverAPI.callPluginMethod("get_fanIsAdapted");
  let fanIsAdapted = false;
  if (res && res.success) {
    fanIsAdapted = r.result;
  }
  dispatch(fanSlice.actions.setFanIsAdapted(fanIsAdapted));
}

export default Content;
