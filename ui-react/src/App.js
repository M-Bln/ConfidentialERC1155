import { config } from "./config";
import { MintNFT } from "./mint";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider, useAccount } from "wagmi";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MintNFT />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
