import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import necessary Injective and Keplr functionalities
import { ChainId } from '@injectivelabs/ts-types';
import { getInjectiveAddress } from '@injectivelabs/sdk-ts';

// Function to check and get Keplr instance
const getKeplr = () => {
  if (!window.keplr) {
    throw new Error('Keplr extension not installed');
  }
  return window.keplr;
};

// Function to enable Keplr and fetch addresses
const enableKeplr = async () => {
  const keplr = getKeplr();
  const chainId = ChainId.Testnet;
  await keplr.enable(chainId);
  const injectiveAddresses = await keplr.getOfflineSigner(chainId).getAccounts();
  console.log(injectiveAddresses);
  return injectiveAddresses;
};

// Render your application
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App enableKeplr={enableKeplr} />
  </StrictMode>
);