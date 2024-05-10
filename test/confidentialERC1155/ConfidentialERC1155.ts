import { expect } from "chai";
import { FhevmInstance } from "fhevmjs";
import { ethers } from "hardhat";

import { createInstances } from "../instance";
import { getSigners, initSigners } from "../signers";
import { deployEncryptedERC1155Fixture } from "./ConfidentialERC1155.fixture";

describe("ConfidentialERC1155", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const contract = await deployEncryptedERC1155Fixture();
    this.contractAddress = await contract.getAddress();
    this.erc1155 = contract;
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);
  });

  function encryptDataArray(instance: FhevmInstance, data: number[]): Uint8Array[] {
    return data.map((x) => instance.encrypt32(x));
  }

  function decryptDataArray(instance: FhevmInstance, contractAddress: string, data: string[]): bigint[] {
    return data.map((x) => instance.decrypt(contractAddress, x));
  }

  it("should mint token", async function () {
    const encryptedDataArray = encryptDataArray(this.instances.alice, [777]);
    try {
      const transaction = await this.erc1155.mintWithConfidentialData(
        this.signers.alice.address,
        0,
        1000,
        encryptedDataArray,
        "0x",
      );
      const transactionReceipt = await transaction.wait();
      console.log("transactionReceipt:", transactionReceipt?.gasUsed.toString());
      // expect events to be emitted
      await expect(transaction)
        .to.emit(this.erc1155, "TransferSingle")
        .withArgs(
          this.signers.alice.address,
          "0x0000000000000000000000000000000000000000",
          this.signers.alice.address,
          0,
          1000,
        );
      await expect(transaction).to.emit(this.erc1155, "FirstMint").withArgs(0, this.signers.alice.address, 1000, "0x");

      // check balance
      const balance = await this.erc1155.balanceOf(this.signers.alice.address, 0);
      expect(balance).to.equal(1000);
    } catch (e) {
      console.log("should mint error:", e);
    }
  });

  it("should access confidential data", async function () {
    const clearData = [787];
    const encryptedDataArray = encryptDataArray(this.instances.alice, clearData);
    const transaction = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      1000,
      encryptedDataArray,
      "0x",
    );
    await transaction.wait();

    const token = this.instances.alice.getPublicKey(this.contractAddress)!;

    const returnedEncryptedData = await this.erc1155.getConfidentialData(0, token.publicKey, token.signature);
    const decryptedData = decryptDataArray(this.instances.alice, this.contractAddress, returnedEncryptedData);
    expect(decryptedData).to.deep.equal([787]);
  });

  it("should not access confidential data", async function () {
    const clearData = [787];
    const encryptedDataArray = encryptDataArray(this.instances.alice, clearData);
    const transaction = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      1000,
      encryptedDataArray,
      "0x",
    );
    await transaction.wait();

    const bobErc1155 = this.erc1155.connect(this.signers.bob);
    const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;
    await expect(bobErc1155.getConfidentialData(0, tokenBob.publicKey, tokenBob.signature))
      .to.be.revertedWithCustomError(bobErc1155, "RequirePositiveBalance")
      .withArgs(0);
  });

  it("should not set already set confidential data", async function () {
    const clearData1 = [787];
    const encryptedDataArray1 = encryptDataArray(this.instances.alice, clearData1);
    const transaction1 = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      1000,
      encryptedDataArray1,
      "0x",
    );
    await transaction1.wait();

    const clearData2 = [687];
    const encryptedDataArray2 = encryptDataArray(this.instances.alice, clearData2);

    try {
      await this.erc1155.mintWithConfidentialData(this.signers.alice.address, 0, 500, encryptedDataArray2, "0x");
    } catch (e) {
      expect((e as Error).toString().substring(0, 67)).to.be.equal(
        "ProviderError: rpc error: code = Unknown desc = execution reverted:",
      );
    }

    const balance = await this.erc1155.balanceOf(this.signers.alice.address, 0);
    expect(balance).to.equal(1000);
  });

  it("should re-mint token", async function () {
    const encryptedDataArray = encryptDataArray(this.instances.alice, [777]);
    const transaction1 = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      1000,
      encryptedDataArray,
      "0x",
    );
    await transaction1.wait();
    const balance1 = await this.erc1155.balanceOf(this.signers.alice.address, 0);
    expect(balance1).to.equal(1000);

    // re-mint to same address
    const transaction2 = await this.erc1155.reMint(this.signers.alice.address, 0, 500, "0x");
    await transaction2.wait();
    const balance2 = await this.erc1155.balanceOf(this.signers.alice.address, 0);
    expect(balance2).to.equal(1500);

    // re-mint to different address
    const transaction3 = await this.erc1155.reMint(this.signers.bob.address, 0, 800, "0x");
    await transaction3.wait();
    const balance3 = await this.erc1155.balanceOf(this.signers.bob.address, 0);
    expect(balance3).to.equal(800);

    // expect events to be emitted
    await expect(transaction3)
      .to.emit(this.erc1155, "TransferSingle")
      .withArgs(
        this.signers.alice.address,
        "0x0000000000000000000000000000000000000000",
        this.signers.bob.address,
        0,
        800,
      );
    await expect(transaction3).to.emit(this.erc1155, "ReMint").withArgs(0, this.signers.bob.address, 800, "0x");
  });

  it("should transfer tokens between two users", async function () {
    const encryptedDataArray = encryptDataArray(this.instances.alice, [777]);
    const transaction = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      2000,
      encryptedDataArray,
      "0x",
    );
    await transaction.wait();

    const transfer = await this.erc1155.safeTransferFrom(
      this.signers.alice.address,
      this.signers.bob.address,
      0,
      500,
      "0x",
      {},
    );
    await transfer.wait();

    // expect event to be emitted
    await expect(transfer)
      .to.emit(this.erc1155, "TransferSingle")
      .withArgs(this.signers.alice.address, this.signers.alice.address, this.signers.bob.address, 0, 500);

    // check balance
    const balanceAlice = await this.erc1155.balanceOf(this.signers.alice.address, 0);
    expect(balanceAlice).to.equal(1500);

    const balanceBob = await this.erc1155.balanceOf(this.signers.bob.address, 0);
    expect(balanceBob).to.equal(500);
  });
});
