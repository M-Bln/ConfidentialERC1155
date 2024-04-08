import { abi } from "./abi";
import * as React from "react";
import { useWriteContract } from "wagmi";

export function MintNFT() {
  const { writeContract } = useWriteContract();

  // async function submit(e) {
  //   e.preventDefault();
  //   const formData = new FormData(e.target);
  //   const tokenId = formData.get("tokenId");
  //   writeContract({
  //     address: "0xF161F15261233Db423ba1D12eDcc086fa37AF4f3",
  //     abi,
  //     functionName: "mintWithConfidentialData",
  //     args: ["0xf0A5B532fc2A5D8E324Cc2D7c61DBFdC100D391e", 0, 1500, "0x", "0x"],
  //   });
  // }

  return (
    //<form onSubmit={submit}>
    <form>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button type="submit">Mint</button>
      {hash && <div>Transaction Hash: {hash}</div>}
    </form>
  );
}
