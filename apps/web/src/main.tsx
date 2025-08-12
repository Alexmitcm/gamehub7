import "./font.css";
import "./styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Providers from "@/components/Common/Providers";
import { clearWagmiStorage } from "@/helpers/clearWagmiStorage";
import Routes from "./routes";

// Clear Wagmi storage
clearWagmiStorage();

createRoot(document.getElementById("_hey_") as HTMLElement).render(
  <StrictMode>
    <Providers>
      <Routes />
    </Providers>
  </StrictMode>
);
