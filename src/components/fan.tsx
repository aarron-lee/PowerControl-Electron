import { FC } from "react";
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
  selectFanEnabled,
} from "../redux-modules/fanSlice";
import FanCurveCanvas from "./FanCurveCanvas";
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

export const FANDisplayComponent: FC = () => {
  const { profileName, fanProfile } = useSelector(selectActiveProfile);
  const dispatch = useAppDispatch();

  const onChange = (newCurvePoints: any[]) => {
    if (profileName && fanProfile)
      return dispatch(
        fanSlice.actions.setCurvePoints({
          profileName,
          newCurvePoints,
        })
      );
  };

  if (!profileName || !fanProfile) {
    return null;
  }

  const { fanMode, fixSpeed, snapToGrid } = fanProfile;

  return (
    <FanCurveCanvas
      fanMode={fanMode}
      fixSpeed={fixSpeed}
      snapToGrid={snapToGrid}
      curvePoints={fanProfile.curvePoints}
      onChange={onChange}
      setFixSpeed={() => {}}
      // disableDrag
    />
  );
};

//FANRPM模块

export function FANComponent() {
  const enabled = useSelector(selectFanEnabled);

  return (
    <div>
      {enabled && (
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
