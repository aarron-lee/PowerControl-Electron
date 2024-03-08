import { useEffect, useState, useRef, FC } from "react";
import {
  Settings,
  PluginManager,
  ComponentName,
  UpdateType,
  FANMODE,
  getTextPosByCanvasPos,
  fanPosition,
  FANPROFILEACTION,
  FanControl,
} from "../util";
import { localizeStrEnum, localizationManager } from "../i18n";
import { FanCanvas } from "./fanCanvas";
import Dropdown from "./ui/Dropdown";

import FanRpm from "./FanRpm";
import FanCurveModal from "./FanCurveModal";
import { useSelector } from "react-redux";
import { FanCurvePoint, selectActiveProfile } from "../redux-modules/fanSlice";

var fanDisplayIntervalID: any;
const totalLines = 9;
const lineColor = "#1E90FF";
const setPointColor = "#00BFFF";

//选择配置文件下拉框
const FANSelectProfileComponent: FC = () => {
  //@ts-ignore
  const [items, setItems] = useState<DropdownOption[]>(
    Object.entries(Settings.getFanSettings()).map(
      ([profileName, fanSetting]) => ({
        label: profileName,
        options: [
          {
            label: localizationManager.getString(localizeStrEnum.USE),
            data: {
              profileName: profileName,
              type: FANPROFILEACTION.USE,
              setting: fanSetting,
            },
          },
          {
            label: localizationManager.getString(localizeStrEnum.DELETE),
            data: {
              profileName: profileName,
              type: FANPROFILEACTION.DELETE,
              setting: fanSetting,
            },
          },
        ],
      })
    )
  );
  //@ts-ignore
  const [selectedItem, setSelectedItem] = useState<DropdownOption | undefined>(
    items.find((item) => {
      return item?.label == Settings.appFanSettingName();
    })
  );
  return (
    <Dropdown
      disabled={items.length == 0}
      options={items}
      label={
        selectedItem
          ? selectedItem?.label?.toString()
          : items.length == 0
          ? localizationManager.getString(
              localizeStrEnum.CREATE_FAN_PROFILE_TIP
            )
          : localizationManager.getString(
              localizeStrEnum.SELECT_FAN_PROFILE_TIP
            )
      }
      selectedValue={selectedItem}
      onChange={(item) => {
        //setSelectedItem(item);
        if (item.data.type == FANPROFILEACTION.USE) {
          Settings.setAppFanSettingName(item.data.profileName);
        } else if (item.data.type == FANPROFILEACTION.DELETE) {
          Settings.removeFanSetting(item.data.profileName);
        }
      }}
    />
  );
};

const FANDisplayComponent: FC = () => {
  const canvasRef: any = useRef(null);

  const { profileName, fanProfile } = useSelector(selectActiveProfile);

  let curvePoints = [] as FanCurvePoint[];
  if (fanProfile) {
    //@ts-ignore
    curvePoints = fanProfile?.curvePoints || [];
  }
  const initDraw = (ref: any) => {
    canvasRef.current = ref;
  };
  const refresh = () => {
    refreshCanvas();
  };
  const dismount = () => {
    if (fanDisplayIntervalID != null) {
      clearInterval(fanDisplayIntervalID);
    }
  };
  useEffect(() => {
    refresh();
    if (fanDisplayIntervalID != null) {
      clearInterval(fanDisplayIntervalID);
    }
    fanDisplayIntervalID = setInterval(() => {
      refresh();
    }, 1000);
    PluginManager.listenUpdateComponent(
      ComponentName.FAN_DISPLAY,
      [ComponentName.FAN_DISPLAY],
      (_ComponentName, updateType) => {
        switch (updateType) {
          case UpdateType.UPDATE: {
            refresh();
            break;
          }
          case UpdateType.DISMOUNT: {
            dismount();
            break;
          }
        }
      }
    );
  }, []);
  const refreshCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const width: number = ctx.canvas.width;
    const height: number = ctx.canvas.height;
    const lineDistance = 1 / (totalLines + 1);
    ctx.clearRect(0, 0, width, height);
    //网格绘制
    ctx.beginPath();
    ctx.strokeStyle = "#093455";
    for (let i = 1; i <= totalLines + 1; i++) {
      ctx.moveTo(lineDistance * i * width, 0);
      ctx.lineTo(lineDistance * i * width, height);
      ctx.moveTo(0, lineDistance * i * height);
      ctx.lineTo(width, lineDistance * i * height);
    }
    ctx.stroke();
    //文字绘制
    /*
    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";
    for (let i = 1; i <= totalLines + 1; i++) {
      const tempText= tempMax / (totalLines + 1) * i +"°C";
      const fanText= fanMax / (totalLines + 1) * i +"%";
      ctx.textAlign = "right";
      ctx.fillText(tempText, lineDistance * i * width - 2, height - 2);
      ctx.textAlign = "left";
      ctx.fillText(fanText, 2, height-lineDistance * i * height + 10);
    }
    ctx.stroke();*/
    switch (fanProfile?.fanMode) {
      case FANMODE.NOCONTROL: {
        drawNoControlMode();
        break;
      }
      case FANMODE.FIX: {
        drawFixMode();
        break;
      }
      case FANMODE.CURVE: {
        drawCurveMode();
        break;
      }
    }
  };
  const drawNoControlMode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const width: number = ctx.canvas.width;
    const height: number = ctx.canvas.height;
    ctx.beginPath();
    ctx.fillStyle = setPointColor;
    ctx.textAlign = "left";
    ctx.fillText(
      localizationManager.getString(localizeStrEnum.CURENT_STAT),
      22,
      16
    );
    ctx.arc(12, 12, 5, 0, Math.PI * 2);
    ctx.fill();
    //绘制实际点
    ctx.fillStyle = setPointColor;
    var nowPointCanPos = FanControl.nowPoint.getCanvasPos(width, height);
    var textPos = getTextPosByCanvasPos(
      nowPointCanPos[0],
      nowPointCanPos[1],
      width,
      height
    );
    ctx.fillText(
      `(${Math.trunc(FanControl.nowPoint.temperature!!)}°C,${Math.trunc(
        FanControl.nowPoint.fanRPMpercent!!
      )}%)`,
      textPos[0],
      textPos[1]
    );
    ctx.arc(nowPointCanPos[0], nowPointCanPos[1], 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
  };
  const drawFixMode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const width: number = ctx.canvas.width;
    const height: number = ctx.canvas.height;
    const anchorPoint = new fanPosition(
      fanPosition.tempMax / 2,
      Settings.appFanSetting()?.fixSpeed!!
    ).getCanvasPos(width, height);
    //说明绘制
    ctx.beginPath();
    ctx.fillStyle = setPointColor;
    ctx.textAlign = "left";
    ctx.fillText(
      localizationManager.getString(localizeStrEnum.CURENT_STAT),
      22,
      16
    );
    ctx.arc(12, 12, 5, 0, Math.PI * 2);
    ctx.fill();
    //点线绘制
    var lineStart = [0, anchorPoint[1]];
    var lineEnd = [width, anchorPoint[1]];
    var textPos = getTextPosByCanvasPos(
      anchorPoint[0],
      anchorPoint[1],
      width,
      height
    );
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    //ctx.fillText(`(${Math.trunc(Settings.appFanSetting()?.fixSpeed!!!!)}%)`, textPos[0],textPos[1]);
    ctx.moveTo(lineStart[0], lineStart[1]);
    ctx.lineTo(lineEnd[0], lineEnd[1]);
    ctx.stroke();
    //绘制设置点
    ctx.beginPath();
    ctx.fillStyle = setPointColor;
    var setPointCanPos = FanControl.setPoint.getCanvasPos(width, height);
    var textPos = getTextPosByCanvasPos(
      setPointCanPos[0],
      setPointCanPos[1],
      width,
      height
    );
    ctx.fillText(
      `(${Math.trunc(FanControl.setPoint.temperature!!)}°C,${Math.trunc(
        FanControl.setPoint.fanRPMpercent!!
      )}%)`,
      textPos[0],
      textPos[1]
    );
    ctx.arc(setPointCanPos[0], setPointCanPos[1], 5, 0, Math.PI * 2);
    ctx.fill();
  };
  const drawCurveMode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const width: number = ctx.canvas.width;
    const height: number = ctx.canvas.height;
    curvePoints = curvePoints.sort((a, b) => {
      return a.temperature == b.temperature
        ? a.fanRPMpercent!! - b.fanRPMpercent!!
        : a.temperature!! - b.temperature!!;
    });
    //说明绘制
    ctx.beginPath();
    ctx.fillStyle = setPointColor;
    ctx.textAlign = "left";
    ctx.fillText(
      localizationManager.getString(localizeStrEnum.CURENT_STAT),
      22,
      16
    );
    ctx.arc(12, 12, 5, 0, Math.PI * 2);
    ctx.fill();
    //绘制线段
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.strokeStyle = lineColor;
    for (let pointIndex = 0; pointIndex < curvePoints.length; pointIndex++) {
      var curvePoint = curvePoints[pointIndex];
      var pointCanvasPos = (curvePoint as fanPosition).getCanvasPos(
        width,
        height
      );
      ctx.lineTo(pointCanvasPos[0], pointCanvasPos[1]);
      ctx.moveTo(pointCanvasPos[0], pointCanvasPos[1]);
    }
    ctx.lineTo(width, 0);
    ctx.stroke();

    //绘制实际点和设置点
    ctx.beginPath();
    ctx.fillStyle = setPointColor;
    var setPointCanPos = FanControl.setPoint.getCanvasPos(width, height);
    var textPos = getTextPosByCanvasPos(
      setPointCanPos[0],
      setPointCanPos[1],
      width,
      height
    );
    ctx.fillText(
      `(${Math.trunc(FanControl.setPoint.temperature!!)}°C,${Math.trunc(
        FanControl.setPoint.fanRPMpercent!!
      )}%)`,
      textPos[0],
      textPos[1]
    );
    ctx.arc(setPointCanPos[0], setPointCanPos[1], 5, 0, Math.PI * 2);
    ctx.fill();
    //绘制点和坐标
    /*
    for(let pointIndex = 0; pointIndex < curvePoints.current.length;pointIndex++){
      var curvePoint = curvePoints.current[pointIndex];
      var pointCanvasPos = curvePoint.getCanvasPos(width,height);
      var textPox = getTextPosByCanvasPos(pointCanvasPos[0],pointCanvasPos[1],width,height)
      ctx.beginPath();
      ctx.fillStyle = curvePoint == selectedPoint.current?selectColor:pointColor;
      ctx.arc(pointCanvasPos[0],pointCanvasPos[1],8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = textColor;
      ctx.fillText(`(${Math.trunc(curvePoint.temperature!!)}°C,${Math.trunc(curvePoint.fanRPMpercent!!)}%)`, textPox[0],textPox[1]);
      ctx.fill();
    }
    */
  };
  return (
    <FanCanvas
      width={250}
      height={250}
      style={{
        width: "250px",
        height: "250px",
        border: "1px solid #1a9fff",
        padding: "0px",
        // @ts-ignore
        "background-color": "#1a1f2c",
        "border-radius": "4px",
        "margin-top": "10px",
        "margin-left": "8px",
      }}
      initDraw={(f: any) => {
        initDraw(f);
      }}
    />
  );
};

//FANRPM模块

export function FANComponent() {
  const [show, setShow] = useState<boolean>(Settings.ensureEnable());
  const hide = (ishide: boolean) => {
    setShow(!ishide);
  };
  // listen Settings
  useEffect(() => {
    PluginManager.listenUpdateComponent(
      ComponentName.FAN_ALL,
      [ComponentName.FAN_ALL],
      (_ComponentName, updateType) => {
        switch (updateType) {
          case UpdateType.HIDE: {
            hide(true);
            break;
          }
          case UpdateType.SHOW: {
            hide(false);
            break;
          }
        }
      }
    );
  }, []);
  //<FANSelectProfileComponent/>
  return (
    <div>
      {show && (
        <>
          <FANSelectProfileComponent />
          <FANDisplayComponent />
          <FanRpm />
          <FanCurveModal />
        </>
      )}
    </div>
  );
}
