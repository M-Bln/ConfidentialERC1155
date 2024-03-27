import { ethers } from "hardhat";

import type { ConfidentialERC1155 } from "../../types";
import { getSigners } from "../signers";

export async function deployEncryptedERC1155Fixture(): Promise<ConfidentialERC1155> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("ConfidentialERC1155");
  const contract = await contractFactory.connect(signers.alice).deploy("contractURI"); // City of Zama's battle
  await contract.waitForDeployment();

  return contract;
}
