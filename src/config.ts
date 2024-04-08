import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

const projectId = "<WALLETCONNECT_PROJECT_ID>";

const fheLocalhost = defineChain({
  id: 9_000,
  name: "fheLocalhost",
  nativeCurrency: {
    decimals: 18,
    name: "tEVMOS",
    symbol: "TEVMOS",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
});

const metaMaskConnector = injected({ target: "metaMask" });

export const config = createConfig({
  chains: [fheLocalhost],
  connectors: [metaMaskConnector],
  transports: {
    [fheLocalhost.id]: http(),
  },
});
