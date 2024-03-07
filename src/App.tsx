import Content from "./Content";
import { Provider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";
import "./App.css";
import { store } from "./redux-modules/store";

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Content />
      </ChakraProvider>
    </Provider>
  );
}

export default App;
