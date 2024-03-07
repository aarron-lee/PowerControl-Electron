// import {
//   PanelSection,
//   PanelSectionRow,
//   Field,
//   ButtonItem,
//   showModal,
//   ModalRoot,
//   DialogButton,
//   TextField,
//   SliderField,
//   Dropdown,
//   DropdownOption,
//   Focusable,
// } from "decky-frontend-lib";
import { useEffect, useState, useRef, FC } from "react";
import {
  Settings,
  PluginManager,
  ComponentName,
  UpdateType,
  FANMODE,
  getTextPosByCanvasPos,
  fanPosition,
  FanSetting,
  FANPROFILEACTION,
  FanControl,
} from "../util";
import { localizeStrEnum, localizationManager } from "../i18n";
import { FanCanvas } from "./fanCanvas";
import Dropdown from "./ui/Dropdown";
import {
  Button,
  FormLabel,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  ModalHeader,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  ModalOverlay,
  Slider,
  useDisclosure,
  ModalFooter,
} from "@chakra-ui/react";
var fanRPMIntervalID: any;
var fanDisplayIntervalID: any;
const totalLines = 9;
const pointBlockDis = 5;
const pointColor = "#1A9FFF";
const selectColor = "#FF0000";
const textColor = "#FFFFFF";
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
  const curvePoints: any = useRef([]);
  const initDraw = (ref: any) => {
    canvasRef.current = ref;
    curvePoints.current = Settings.appFanSetting()?.curvePoints;
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
    switch (Settings.appFanSetting()?.fanMode) {
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
    curvePoints.current = curvePoints.current.sort(
      (a: fanPosition, b: fanPosition) => {
        return a.temperature == b.temperature
          ? a.fanRPMpercent!! - b.fanRPMpercent!!
          : a.temperature!! - b.temperature!!;
      }
    );
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
    for (
      let pointIndex = 0;
      pointIndex < curvePoints.current.length;
      pointIndex++
    ) {
      var curvePoint = curvePoints.current[pointIndex];
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
const FANRPMComponent: FC = () => {
  const [fanrpm, setFanRPM] = useState<number>(0);
  const refresh = async () => {
    setFanRPM(FanControl.fanRPM);
  };
  const dismount = () => {
    if (fanRPMIntervalID != null) {
      clearInterval(fanRPMIntervalID);
    }
  };
  useEffect(() => {
    if (fanRPMIntervalID != null) {
      clearInterval(fanRPMIntervalID);
    }
    fanRPMIntervalID = setInterval(() => {
      refresh();
    }, 1000);
    PluginManager.listenUpdateComponent(
      ComponentName.FAN_RPM,
      [ComponentName.FAN_RPM],
      (_ComponentName, updateType) => {
        switch (updateType) {
          case UpdateType.DISMOUNT: {
            dismount();
            break;
          }
        }
      }
    );
  }, []);
  return (
    <div id={localizationManager.getString(localizeStrEnum.FAN_SPEED)}>
      {fanrpm + " RPM"}
    </div>
  );
};

const FANCreateProfileComponent: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        onClick={() => {
          onOpen();
        }}
      >
        {localizationManager.getString(localizeStrEnum.CREATE_FAN_PROFILE)}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <FANCretateProfileModelComponent closeModal={onClose} />
        </ModalContent>
      </Modal>
    </>
  );
};

function FANCretateProfileModelComponent({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const canvasRef: any = useRef(null);
  const curvePoints: any = useRef([]);
  //drag
  const dragPoint: any = useRef(null);
  //select
  const selectedPoint: any = useRef(null);

  const [profileName, setProfileName] = useState<string>();
  //@ts-ignore
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [fanMode, setFanMode] = useState(FANMODE.NOCONTROL);
  const [fixSpeed, setFixSpeed] = useState(50);
  const [selPointTemp, setSelPointTemp] = useState(0);
  const [selPointSpeed, setSelPointSpeed] = useState(0);
  const initDraw = (ref: any) => {
    canvasRef.current = ref;
  };
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
    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";
    for (let i = 1; i <= totalLines + 1; i++) {
      const tempText = (fanPosition.tempMax / (totalLines + 1)) * i + "°C";
      const fanText = (fanPosition.fanMax / (totalLines + 1)) * i + "%";
      ctx.textAlign = "right";
      ctx.fillText(tempText, lineDistance * i * width - 2, height - 2);
      ctx.textAlign = "left";
      ctx.fillText(fanText, 2, height - lineDistance * i * height + 10);
    }
    ctx.stroke();
    switch (fanMode) {
      case FANMODE.NOCONTROL: {
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
  const drawFixMode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const width: number = ctx.canvas.width;
    const height: number = ctx.canvas.height;
    const anchorPoint = new fanPosition(
      fanPosition.tempMax / 2,
      fixSpeed
    ).getCanvasPos(width, height);
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
    ctx.fillText(`(${Math.trunc(fixSpeed!!)}%)`, textPos[0], textPos[1]);
    ctx.moveTo(lineStart[0], lineStart[1]);
    ctx.lineTo(lineEnd[0], lineEnd[1]);
    ctx.stroke();
  };
  const drawCurveMode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const width: number = ctx.canvas.width;
    const height: number = ctx.canvas.height;
    curvePoints.current = curvePoints.current.sort(
      (a: fanPosition, b: fanPosition) => {
        return a.temperature == b.temperature
          ? a.fanRPMpercent!! - b.fanRPMpercent!!
          : a.temperature!! - b.temperature!!;
      }
    );

    //绘制线段
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.strokeStyle = lineColor;
    for (
      let pointIndex = 0;
      pointIndex < curvePoints.current.length;
      pointIndex++
    ) {
      var curvePoint = curvePoints.current[pointIndex];
      var pointCanvasPos = curvePoint.getCanvasPos(width, height);
      ctx.lineTo(pointCanvasPos[0], pointCanvasPos[1]);
      ctx.moveTo(pointCanvasPos[0], pointCanvasPos[1]);
    }
    ctx.lineTo(width, 0);
    ctx.stroke();
    //绘制点和坐标
    for (
      let pointIndex = 0;
      pointIndex < curvePoints.current.length;
      pointIndex++
    ) {
      var curvePoint = curvePoints.current[pointIndex];
      var pointCanvasPos = curvePoint.getCanvasPos(width, height);
      var textPox = getTextPosByCanvasPos(
        pointCanvasPos[0],
        pointCanvasPos[1],
        width,
        height
      );
      ctx.beginPath();
      ctx.fillStyle =
        curvePoint == selectedPoint.current ? selectColor : pointColor;
      ctx.arc(pointCanvasPos[0], pointCanvasPos[1], 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = textColor;
      ctx.fillText(
        `(${Math.trunc(curvePoint.temperature!!)}°C,${Math.trunc(
          curvePoint.fanRPMpercent!!
        )}%)`,
        textPox[0],
        textPox[1]
      );
      ctx.fill();
    }
  };
  const onCreateProfile = () => {
    return Settings.addFanSetting(
      profileName!!,
      new FanSetting(snapToGrid, fanMode, fixSpeed, curvePoints.current)
    );
  };
  useEffect(() => {
    refreshCanvas();
  }, [snapToGrid, fanMode, fixSpeed]);
  useEffect(() => {
    if (selectedPoint.current) {
      selectedPoint.current.temperature = selPointTemp;
      selectedPoint.current.fanRPMpercent = selPointSpeed;
      refreshCanvas();
    }
  }, [selPointTemp, selPointSpeed]);
  useEffect(() => {
    refreshCanvas();
  }, []);

  function onPointerShortPress(shortPressPos: fanPosition): void {
    switch (fanMode) {
      case FANMODE.NOCONTROL: {
      }
      case FANMODE.FIX: {
        var percent = shortPressPos.fanRPMpercent!!;
        setFixSpeed(percent);
        break;
      }
      case FANMODE.CURVE: {
        var isPressPoint = false;
        //短按时如果按到点 删除该点
        //如果该点是选中点 取消选中
        for (let i = 0; i < curvePoints.current.length; i++) {
          if (
            curvePoints.current[i].isCloseToOther(shortPressPos, pointBlockDis)
          ) {
            if (curvePoints.current[i] == selectedPoint.current) {
              selectedPoint.current = null;
              setSelPointTemp(0);
              setSelPointSpeed(0);
            }
            curvePoints.current.splice(i, 1);
            isPressPoint = true;
            break;
          }
        }
        //没有按到点 在该位置生成一个点
        if (!isPressPoint) curvePoints.current.push(shortPressPos);
        /*
        //选中点时再点击则取消该点,点击其他位置则取消当前选中
        if(selectedPoint.current){
          for(let i=0;i<curvePoints.current.length;i++){
            if(shortPressPos.isCloseToOther(selectedPoint.current,pointBlockDis)&&curvePoints.current[i]==selectedPoint.current){
              curvePoints.current.splice(i,1);
              break;
            }
          }
          selectedPoint.current = null;
          setSelPointTemp(0);
          setSelPointSpeed(0);
        }else{
          //没有选中点时，获取选中的点
          for(let i=0;i<curvePoints.current.length;i++){
            if(curvePoints.current[i].isCloseToOther(shortPressPos,pointBlockDis)){
              selectedPoint.current = curvePoints.current[i];
              setSelPointTemp(selectedPoint.current.temperature);
              setSelPointSpeed(selectedPoint.current.fanRPMpercent);
              break;
            }
          }
          if(!selectedPoint.current){
            curvePoints.current.push(shortPressPos);
          }
        }*/
        refreshCanvas();
        break;
      }
    }
  }

  function onPointerLongPress(longPressPos: fanPosition): void {
    switch (fanMode) {
      case FANMODE.NOCONTROL: {
        break;
      }
      case FANMODE.FIX: {
        var percent = longPressPos.fanRPMpercent!!;
        setFixSpeed(percent);
        break;
      }
      case FANMODE.CURVE: {
        //长按时按到点 则选中该点
        for (let i = 0; i < curvePoints.current.length; i++) {
          if (
            longPressPos.isCloseToOther(curvePoints.current[i], pointBlockDis)
          ) {
            selectedPoint.current = curvePoints.current[i];
            setSelPointTemp(Math.trunc(selectedPoint.current.temperature));
            setSelPointSpeed(Math.trunc(selectedPoint.current.fanRPMpercent));
            break;
          }
        }
        /*
        //选中点时如果长按该点 则取消选中
        if(selectedPoint.current){
          for(let i=0;i<curvePoints.current.length;i++){
            if(longPressPos.isCloseToOther(selectedPoint.current,pointBlockDis)&&curvePoints.current[i]==selectedPoint.current){
              curvePoints.current.splice(i,1);
              break;
            }
          }
          selectedPoint.current = null;
          setSelPointTemp(0);
          setSelPointSpeed(0);
        }else{
          //没有选中点时，获取选中的点
          for(let i=0;i<curvePoints.current.length;i++){
            if(curvePoints.current[i].isCloseToOther(shortPressPos,pointBlockDis)){
              selectedPoint.current = curvePoints.current[i];
              setSelPointTemp(selectedPoint.current.temperature);
              setSelPointSpeed(selectedPoint.current.fanRPMpercent);
              break;
            }
          }
          if(!selectedPoint.current){
            curvePoints.current.push(shortPressPos);
          }
        }*/
        refreshCanvas();
        break;
      }
    }
  }
  function onPointerDragDown(dragDownPos: fanPosition): boolean {
    switch (fanMode) {
      case FANMODE.NOCONTROL: {
        return false;
      }
      case FANMODE.FIX: {
        if (Math.abs(dragDownPos.fanRPMpercent!! - fixSpeed) <= 3) return true;
      }
      case FANMODE.CURVE:
        {
          for (let i = 0; i < curvePoints.current.length; i++) {
            if (
              curvePoints.current[i].isCloseToOther(dragDownPos, pointBlockDis)
            ) {
              dragPoint.current = curvePoints.current[i];
              return true;
            }
          }
        }
        return false;
    }
  }
  function onPointerDraging(fanClickPos: fanPosition): void {
    switch (fanMode) {
      case FANMODE.NOCONTROL: {
      }
      case FANMODE.FIX: {
        setFixSpeed(fanClickPos.fanRPMpercent!!);
        break;
      }
      case FANMODE.CURVE: {
        dragPoint.current.temperature = fanClickPos.temperature;
        dragPoint.current.fanRPMpercent = fanClickPos.fanRPMpercent;
        selectedPoint.current = dragPoint.current;
        setSelPointTemp(Math.trunc(selectedPoint.current.temperature));
        setSelPointSpeed(Math.trunc(selectedPoint.current.fanRPMpercent));
        refreshCanvas();
        break;
      }
    }
  }
  return (
    <>
      <ModalHeader>Create Profile</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormLabel>
          {localizationManager.getString(localizeStrEnum.FAN_PROFILE_NAME)}
        </FormLabel>
        <Input
          type="text"
          value={profileName}
          onChange={(e) => {
            setProfileName(e.target.value);
            console.log(e.target.value);
          }}
        />

        <Dropdown
          label={localizationManager.getString(localizeStrEnum.FAN_MODE)}
          selectedValue={fanMode}
          options={[
            {
              notchIndex: FANMODE.NOCONTROL,
              label: `${localizationManager.getString(
                localizeStrEnum.NOT_CONTROLLED
              )}`,
              value: FANMODE.NOCONTROL,
            },
            {
              notchIndex: FANMODE.FIX,
              label: `${localizationManager.getString(localizeStrEnum.FIXED)}`,
              value: FANMODE.FIX,
            },
            {
              notchIndex: FANMODE.CURVE,
              label: `${localizationManager.getString(localizeStrEnum.CURVE)}`,
              value: FANMODE.CURVE,
            },
          ]}
          onChange={(value: number) => {
            setFanMode(value);
          }}
        />
        {fanMode == FANMODE.FIX && (
          <>
            <FormLabel>
              {localizationManager.getString(localizeStrEnum.FAN_SPEED_PERCENT)}
            </FormLabel>
            <Slider
              value={fixSpeed}
              step={1}
              max={100}
              min={0}
              onChange={(value: number) => {
                setFixSpeed(value);
              }}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </>
        )}
        {fanMode == FANMODE.CURVE && (
          <>
            <FormLabel>
              {localizationManager.getString(localizeStrEnum.SENSOR_TEMP)}
            </FormLabel>
            <Slider
              value={selPointTemp}
              // valueSuffix={"°C"}
              // showValue={true}
              // layout={"inline"}
              // disabled={!selectedPoint.current}
              step={1}
              max={fanPosition.tempMax}
              min={0}
              onChange={(value: number) => {
                setSelPointTemp(value);
              }}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </>
        )}
        {fanMode == FANMODE.CURVE && (
          <>
            <FormLabel>
              {localizationManager.getString(localizeStrEnum.FAN_SPEED_PERCENT)}
            </FormLabel>
            <Slider
              value={selPointSpeed}
              // valueSuffix={"%"}
              // showValue={true}
              // layout={"inline"}
              // disabled={!selectedPoint.current}
              step={1}
              max={fanPosition.fanMax}
              min={0}
              onChange={(value: number) => {
                setSelPointSpeed(value);
              }}
            >
              {" "}
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </>
        )}
        <div>
          <FanCanvas
            width={300}
            height={300}
            style={{
              width: "300px",
              height: "300px",
              padding: "0px",
              border: "1px solid #1a9fff",
              // @ts-ignore
              "background-color": "#1a1f2c",
              "border-radius": "4px",
            }} //onClick={(e: any) => onClickCanvas(e)}
            //onPointerDown={(e:any) => onPointerDown(e)}
            //onPointerMove={(e:any) => onPointerMove(e)}
            //onPointerUp={(e:any) => onPointerUp(e)}
            //onPointerDown={(e:fanPosition) => {onPointerDown(e)}}
            //onPointerMove={(e:fanPosition) => {onPointerMove(e)}}
            //onPointerUp={(e:fanPosition) => {onPointerUp(e)}}
            onPointerShortPress={(e: fanPosition) => {
              onPointerShortPress(e);
            }}
            onPointerLongPress={(e: fanPosition) => {
              onPointerLongPress(e);
            }}
            onPointerDragDown={(e: fanPosition) => {
              return onPointerDragDown(e)!!;
            }}
            onPointerDraging={(e: fanPosition) => {
              onPointerDraging(e);
            }}
            initDraw={(f: any) => {
              initDraw(f);
            }}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => {
            if (onCreateProfile()) {
              closeModal();
            }
          }}
        >
          {localizationManager.getString(localizeStrEnum.CREATE)}
        </Button>
        <Button
          onClick={() => {
            closeModal();
          }}
        >
          {localizationManager.getString(localizeStrEnum.CANCEL)}
        </Button>
      </ModalFooter>
    </>
  );
}

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
          <FANRPMComponent />
          <FANCreateProfileComponent />
        </>
      )}
    </div>
  );
}
