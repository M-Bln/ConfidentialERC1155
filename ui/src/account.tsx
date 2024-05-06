import { useEthersProvider, useEthersSigner } from "./ethers-adapters";
import * as React from "react";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

//import { ConnectToFhevm } from './connect-to-fhevm';

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = ensName ? useEnsAvatar({ name: ensName }) : { data: undefined };
  const signer = useEthersSigner({ chainId: 9000 });
  const provider = useEthersProvider({ chainId: 9000 });

  return (
    <div>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
