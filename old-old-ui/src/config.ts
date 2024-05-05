import { http, createConfig as wagmiCreateConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, safe } from "wagmi/connectors";

export const config = wagmiCreateConfig({
  chains: [mainnet, base],
  connectors: [injected(), safe()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
