import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { DAppProvider } from "@usedapp/core";
import { DAPP_CONFIG } from "./config/config.js";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DAppProvider config={DAPP_CONFIG}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DAppProvider>
  </StrictMode>
);
