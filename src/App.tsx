import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Content from "./Content";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Content />
    </>
  );
}

export default App;
