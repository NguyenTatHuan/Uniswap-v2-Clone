import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { DAppProvider } from "@usedapp/core";
import { DAPP_CONFIG } from "./config.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DAppProvider config={DAPP_CONFIG}>
      <App />
    </DAppProvider>
  </StrictMode>
);
