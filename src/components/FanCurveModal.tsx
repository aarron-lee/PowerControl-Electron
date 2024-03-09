import { FC, useRef, useState } from "react";
import Dropdown from "./ui/Dropdown";
import { localizeStrEnum, localizationManager } from "../i18n";
import { FANMODE, fanPosition } from "../util";
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
import { useAppDispatch } from "../redux-modules/store";
import { FanProfile, fanSlice } from "../redux-modules/fanSlice";
import FanCurveCanvas from "./FanCurveCanvas";

const FanCurveModal: FC = () => {
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
          <CreateFanModal closeModal={onClose} />
        </ModalContent>
      </Modal>
    </>
  );
};

function CreateFanModal({ closeModal }: { closeModal: () => void }) {
  const dispatch = useAppDispatch();
  const curvePoints: any = useRef([]);

  const [profileName, setProfileName] = useState<string>();
  //@ts-ignore
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [fanMode, setFanMode] = useState(FANMODE.NOCONTROL);
  const [fixSpeed, setFixSpeed] = useState(50);
  const [selPointTemp, setSelPointTemp] = useState(0);
  const [selPointSpeed, setSelPointSpeed] = useState(0);

  const onChange = (newCurvePoints: any[]) => {
    curvePoints.current = newCurvePoints;
  };

  const onCreateProfile = () => {
    const newProfile = {
      snapToGrid,
      fanMode,
      fixSpeed,
      curvePoints: curvePoints.current,
    } as FanProfile;
    dispatch(
      fanSlice.actions.createOrUpdateFanProfile({
        name: `${profileName}`,
        profile: newProfile,
      })
    );
  };

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
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </>
        )}
        <FanCurveCanvas
          fanMode={fanMode}
          fixSpeed={fixSpeed}
          snapToGrid={snapToGrid}
          curvePoints={curvePoints.current}
          setCurvePoints={onChange}
          setFixSpeed={setFixSpeed}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => {
            closeModal();
          }}
        >
          {localizationManager.getString(localizeStrEnum.CANCEL)}
        </Button>
        <Button
          onClick={() => {
            onCreateProfile();
            closeModal();
          }}
        >
          {localizationManager.getString(localizeStrEnum.CREATE)}
        </Button>
      </ModalFooter>
    </>
  );
}

export default FanCurveModal;
