import { BrowserProvider } from "ethers";
import React from "react";

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

export function App() {
  return <div>Hello!</div>;
}
