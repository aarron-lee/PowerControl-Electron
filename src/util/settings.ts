import { JsonObject, JsonProperty, JsonSerializer } from 'typescript-json-serializer';
import { APPLYTYPE, FANMODE, UpdateType } from './enum';
import { Backend } from './backend';
import { fanPosition } from './position';
import { DEFAULT_APP, PluginManager, RunningApps } from './pluginMain';

const SETTINGS_KEY = "PowerControl";
const serializer = new JsonSerializer();

@JsonObject()
export class AppSetting {
  @JsonProperty()
  overwrite?: boolean;
  @JsonProperty()
  smt?: boolean;
  @JsonProperty()
  cpuNum?: number;
  @JsonProperty()
  cpuboost?: boolean;
  @JsonProperty()
  tdp?:number;
  @JsonProperty()
  tdpEnable?:boolean
  @JsonProperty()
  gpuMode?:number
  @JsonProperty()
  gpuFreq?:number
  @JsonProperty()
  gpuAutoMaxFreq?:number
  @JsonProperty()
  gpuAutoMinFreq?:number
  @JsonProperty()
  gpuRangeMaxFreq?:number
  @JsonProperty()
  gpuRangeMinFreq?:number
  @JsonProperty()
  fanProfileName?:string;
  constructor(){
    this.overwrite=false;
  }
  deepCopy(copyTarget:AppSetting){
    this.overwrite=copyTarget.overwrite;
    this.fanProfileName=copyTarget.fanProfileName;
  }
}

@JsonObject()
export class FanSetting{
  @JsonProperty()
  snapToGrid?:boolean = false;
  @JsonProperty()
  fanMode?:number = FANMODE.NOCONTROL
  @JsonProperty()
  fixSpeed?:number = 50;
  @JsonProperty({type:fanPosition})
  curvePoints?:fanPosition[] = []
  constructor(snapToGrid:boolean,fanMode:number,fixSpeed:number,curvePoints:fanPosition[]){
    this.snapToGrid=snapToGrid;
    this.fanMode=fanMode;
    this.fixSpeed=fixSpeed;
    this.curvePoints = curvePoints;
  }
}

@JsonObject()
export class Settings {
  private static _instance:Settings = new Settings();
  @JsonProperty()
  public enabled: boolean = true;
  @JsonProperty({isDictionary:true, type: AppSetting })
  public perApp: { [appId: string]: AppSetting } = {};
  @JsonProperty({isDictionary:true, type: FanSetting })
  public fanSettings: { [fanProfile: string]: FanSetting } = {};
  //插件是否开启
  public static ensureEnable():boolean{
    return this._instance.enabled;
  }

  //设置开启关闭
  public static setEnable(enabled:boolean){
    if(this._instance.enabled != enabled){
      this._instance.enabled = enabled;
      Settings.saveSettingsToLocalStorage();
      if(enabled){
        Backend.applySettings(APPLYTYPE.SET_ALL);
        PluginManager.updateAllComponent(UpdateType.SHOW);
      }else{
        Backend.resetSettings();
        PluginManager.updateAllComponent(UpdateType.HIDE);
      }
      PluginManager.updateAllComponent(UpdateType.UPDATE);
    }
  }

  //获取当前配置文件
  public static ensureApp(): AppSetting {
    const appId = RunningApps.active(); 
    //没有配置文件的时候新生成一个
    if (!(appId in this._instance.perApp)) {
      this._instance.perApp[appId]=new AppSetting();
      //新生成后如果有默认配置文件，则拷贝默认配置文件
      if(DEFAULT_APP in this._instance.perApp)
        this._instance.perApp[appId].deepCopy(this._instance.perApp[DEFAULT_APP]);
    }
    //如果未开启覆盖，则使用默认配置文件
    if(!this._instance.perApp[appId].overwrite){
      return this._instance.perApp[DEFAULT_APP];
    }
    //使用appID配置文件
    return this._instance.perApp[appId];
  }

  static ensureAppID():string{
    const appId = RunningApps.active();
    if (!(appId in this._instance.perApp)) {
      this._instance.perApp[appId]=new AppSetting();
      if(DEFAULT_APP in this._instance.perApp){
        this._instance.perApp[appId].deepCopy(this._instance.perApp[DEFAULT_APP]);
        return DEFAULT_APP;
      }
      return appId;
    }
    if(!this._instance.perApp[appId].overwrite){
      return DEFAULT_APP;
    }
    return appId;
  }

  static appOverWrite():boolean {
    if(RunningApps.active()==DEFAULT_APP){
      return false;
    }
    return Settings.ensureApp().overwrite!!;
  }
  static setOverWrite(overwrite:boolean){
    if(RunningApps.active()!=DEFAULT_APP&&Settings.appOverWrite()!=overwrite){
      Settings._instance.perApp[RunningApps.active()].overwrite=overwrite;
      Settings.saveSettingsToLocalStorage();
      Backend.applySettings(APPLYTYPE.SET_ALL);
      PluginManager.updateAllComponent(UpdateType.UPDATE);
    }
  }

  //风扇配置文件名称
  static appFanSettingName(){
    return Settings.ensureApp().fanProfileName
  }

  //风扇配置文件内容
  static appFanSetting(){
    var fanProfileName = Settings.ensureApp().fanProfileName!!;
    if(fanProfileName in this._instance.fanSettings){
      return this._instance.fanSettings[fanProfileName];
    }else{
      return undefined; 
    }
  }

  //设置使用的风扇配置文件名称
  static setAppFanSettingName(fanProfileName:string){
    if(Settings.ensureApp().fanProfileName!=fanProfileName){
      Settings.ensureApp().fanProfileName=fanProfileName;
      Settings.saveSettingsToLocalStorage();
      //Backend.applySettings(APPLYTYPE.SET_FAN);
    }
  }

  //添加一个风扇配置
  static addFanSetting(fanProfileName:string,fanSetting:FanSetting){
    if(fanProfileName!=undefined){
      this._instance.fanSettings[fanProfileName] = fanSetting;
      Settings.saveSettingsToLocalStorage();
      return true;
    }else{
      return false;
    }
  }
  //删除一个风扇配置
  static removeFanSetting(fanProfileName:string){
    if(fanProfileName in this._instance.fanSettings){
      delete this._instance.fanSettings[fanProfileName];
      Object.entries(this._instance.perApp).forEach(([_appID, appSettings]) => {
        if(appSettings.fanProfileName==fanProfileName){
          appSettings.fanProfileName=this._instance.perApp[DEFAULT_APP].fanProfileName;
        }
      })
      Settings.saveSettingsToLocalStorage();
    }
  }


  //获取风扇配置列表
  static getFanSettings():{[fanProfile: string]:FanSetting}{
    return this._instance.fanSettings;
  }

  static loadSettingsFromLocalStorage(){
    const settingsString = localStorage.getItem(SETTINGS_KEY) || "{}";
    const settingsJson = JSON.parse(settingsString);
    const loadSetting=serializer.deserializeObject(settingsJson, Settings);
    this._instance.enabled = loadSetting?loadSetting.enabled:false;
    this._instance.perApp = loadSetting?loadSetting.perApp:{};
    this._instance.fanSettings=loadSetting?loadSetting.fanSettings:{};
  }

  static saveSettingsToLocalStorage() {
    const settingsJson = serializer.serializeObject(this._instance);
    const settingsString = JSON.stringify(settingsJson);
    localStorage.setItem(SETTINGS_KEY, settingsString);
  }

}
