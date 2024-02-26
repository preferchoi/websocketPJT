import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider, theme } from "@chakra-ui/react";
import App from "./App.jsx";
import Lobby from "./pages/Lobby.jsx";
import Room from "./pages/Room.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:serverName" element={<Lobby />} />
          <Route path="/:nspName/:roomName" element={<Room />} />
        </Routes>
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);
