import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SettingsComponent, FANComponent } from "./components";
import { AppDispatch } from "./redux-modules/store";
import { fanSlice, selectInitialLoad } from "./redux-modules/fanSlice";
import { powerControlPluginListener } from "./pluginListeners";
import serverAPI from "./util/serverApi";

const Content: FC<{}> = ({}) => {
  const initialLoading = useSelector(selectInitialLoad);

  useAppInitialize();

  if (initialLoading) {
    return null;
  }

  return (
    <div>
      <SettingsComponent />
      <FANComponent />
    </div>
  );
};

function useAppInitialize() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fanSlice.actions.loadLocalStorage());
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
    fanIsAdapted = res.result;
  }
  dispatch(fanSlice.actions.setFanIsAdapted(fanIsAdapted));

  setTimeout(() => {
    dispatch(fanSlice.actions.setInitialLoad(false));
  }, 0);
}

export default Content;
