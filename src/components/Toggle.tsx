import { FC } from "react";
import { Flex, FormLabel, Box, Checkbox } from "@chakra-ui/react";

interface Props {
  label: string;
  checked: boolean;
  onChange: (enabled: boolean) => void;
}

const Toggle: FC<Props> = ({ label, checked, onChange }) => {
  return (
    <Flex flexDirection="row" alignItems="center">
      <FormLabel margin="0.3rem 0">{label}</FormLabel>
      <Box flexGrow="1"></Box>
      <Checkbox
        isChecked={checked}
        onChange={(e) => onChange(Boolean(e.target.checked))}
      />
    </Flex>
  );
};

export default Toggle;
