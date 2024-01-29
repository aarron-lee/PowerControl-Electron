
export enum FANMODE{
    NOCONTROL=0, //不控制
    FIX=1, //固定
    CURVE=2, //曲线
}

export enum FANPROFILEACTION{
    DELETE="DELETE",    //删除风扇配置
    USE="USE",  //使用风扇配置
}

export enum APPLYTYPE{
    SET_ALL = "ALL",
    SET_FANMODE = "SET_FANMODE",
    SET_FANRPM = "SET_FANRPM",
}

export enum ComponentName{
    SET_ENABLE="SET_ENABLE",
    SET_PERAPP="SET_PERAPP",
    FAN_ALL="FAN_ALL",
    FAN_RPM="FAN_RPM",
    FAN_DISPLAY="FAN_DISPLAY"
}

export enum UpdateType{
    DISABLE="DISABLE",
    UPDATE="UPDATE",
    HIDE="HIDE",
    SHOW="SHOW",
    ENABLE="ENABLE",
    DISMOUNT="DISMOUNT"
}

export enum PluginState{
    INIT="0",
    RUN="1",
    QUIT="2",
  }