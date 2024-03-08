import { useEffect, useState, FC } from "react";
import { Settings, PluginManager, ComponentName, UpdateType } from "../util";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Flex,
  FormLabel,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
} from "@chakra-ui/react";

import FanRpm from "./FanRpm";
import FanCurveModal from "./FanCurveModal";
import { useSelector } from "react-redux";
import {
  fanSlice,
  selectActiveProfile,
  selectActiveProfileName,
  selectAllProfiles,
} from "../redux-modules/fanSlice";
import FanCurveCanvas from "./FanCurveCanvas";
import { cloneDeep } from "lodash";
import { useAppDispatch } from "../redux-modules/store";
import FanTemp from "./FanTemp";

const FanProfileDropdown: FC = () => {
  const activeProfileName = useSelector(selectActiveProfileName);
  const allProfiles = useSelector(selectAllProfiles);

  const dispatch = useAppDispatch();

  const onChange = (value: string) => {
    dispatch(fanSlice.actions.setActiveFanProfile(value));
  };

  const options = Object.entries(allProfiles).map(([profileName, profile]) => {
    return {
      label: profileName,
      value: profileName,
      profile,
    };
  });

  return (
    <Flex flexDirection="column">
      <FormLabel>Select Fan Profile</FormLabel>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          disabled={options.length === 0}
        >
          {activeProfileName}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup type="radio" value={activeProfileName}>
            {options.map((option) => {
              return (
                <MenuItemOption
                  key={option?.label}
                  value={option?.value}
                  onClick={() => {
                    onChange(option.value);
                  }}
                >
                  {option?.label}
                </MenuItemOption>
              );
            })}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Flex>
  );
};

const FANDisplayComponent: FC = () => {
  const { profileName, fanProfile } = useSelector(selectActiveProfile);

  if (!profileName || !fanProfile) {
    return null;
  }

  const { fanMode, fixSpeed, snapToGrid, curvePoints } = fanProfile;

  return (
    <FanCurveCanvas
      fanMode={fanMode}
      fixSpeed={fixSpeed}
      snapToGrid={snapToGrid}
      curvePoints={cloneDeep(curvePoints)}
      setFixSpeed={() => {}}
      disableDrag
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
          <FanProfileDropdown />
          <FANDisplayComponent />
          <FanRpm />
          <FanTemp />
          <FanCurveModal />
        </>
      )}
    </div>
  );
}
