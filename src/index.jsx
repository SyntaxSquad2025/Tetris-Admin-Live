// import React from 'react';
// import { createRoot } from 'react-dom/client';

// import { ConfigProvider } from './contexts/ConfigContext';

// import './index.scss';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(
//   <ConfigProvider>
//     <App />
//   </ConfigProvider>
// );

// reportWebVitals();

import React from "react";
import { createRoot } from "react-dom/client";

import { ConfigProvider } from "./contexts/ConfigContext";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { THEME } from "@tonconnect/ui-react";

import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <>
    {/* <TonConnectUIProvider
      manifestUrl="https://modadmin.strtesting.com/tonconnect-manifest.json"> */}
    <TonConnectUIProvider
      manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json"
      uiPreferences={{ theme: THEME.DARK }}
      walletsListConfiguration={{
        includeWallets: [
          {
            appName: "tonwallet",
            name: "TON Wallet",
            imageUrl: "https://wallet.ton.org/assets/ui/qr-logo.png",
            aboutUrl:
              "https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd",
            universalLink: "https://wallet.ton.org/ton-connect",
            jsBridgeKey: "tonwallet",
            bridgeUrl: "https://bridge.tonapi.io/bridge",
            platforms: ["chrome", "android"],
          },
          {
            appName: "tonflow",
            name: "TONFLOW",
            imageUrl: "https://tonflow.app/assets/images/tonflow_ico_256.png",
            aboutUrl: "https://tonflow.app",
            universalLink: "https://tonflow.app/ton-connect",
            deepLink: "tonflow-tc://",
            bridgeUrl: "https://bridge.tonapi.io/bridge",
            jsBridgeKey: "tonflow",
            platforms: ["windows", "linux", "macos", "chrome"],
          },
        ],
      }}
      actionsConfiguration={{
        twaReturnUrl: "https://t.me/DemoDappWithTonConnectBot/demo",
      }}
    >
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </TonConnectUIProvider>
  </>
);

reportWebVitals();
