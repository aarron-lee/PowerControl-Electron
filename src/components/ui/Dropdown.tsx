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

type Props = {
  disabled?: boolean;
  options: any[];
  label: string;
  selectedValue: number;
  onChange: (item: any) => void;
};

const Dropdown: FC<Props> = ({
  disabled = false,
  options,
  label,
  selectedValue,
  onChange,
}) => {
  const selectedOption = options?.find((o) => o?.value === selectedValue);
  return (
    <Flex flexDirection="column">
      <FormLabel>{label}</FormLabel>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          disabled={disabled}
        >
          {selectedOption?.label}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup type="radio" value={selectedOption?.value}>
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

export default Dropdown;
