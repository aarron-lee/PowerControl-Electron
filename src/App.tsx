import Content from "./Content";
import { ChakraProvider } from "@chakra-ui/react";
import "./App.css";

function App() {
  return (
    <ChakraProvider>
      <Content />
    </ChakraProvider>
  );
}

export default App;
