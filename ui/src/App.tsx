import { Account } from "./account";
import { config } from "./config";
import { WalletOptions } from "./wallet-options";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider, useAccount } from "wagmi";

// import { Account } from './account'
// import { WalletOptions } from './wallet-options'
// import { Buffer } from 'buffer';
// window.Buffer = Buffer;

const queryClient = new QueryClient();

function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}

function App() {
  // return (
  //   <WagmiProvider config={config}>
  //     <ConnectWallet />
  //   </WagmiProvider>
  // );
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectWallet />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
