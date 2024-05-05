import { type Chain } from "viem";
import { createConfig, http } from "wagmi";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

const fheLocalhost: Chain = {
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
};

export const config = createConfig({
  chains: [fheLocalhost],
  connectors: [injected(), safe()],
  transports: {
    [fheLocalhost.id]: http(),
    //[base.id]: http(),
  },
});
