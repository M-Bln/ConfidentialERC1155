import { expect } from "chai";
import { ethers } from "hardhat";

import { ConfidentialERC1155 } from "../../types";
import { createInstances } from "../instance";
import { getSigners, initSigners } from "../signers";
import { deployEncryptedERC1155Fixture } from "./ConfidentialERC1155.fixture";

describe("ConfidentialERC1155", function () {
  //let contractInstance: ConfidentialERC1155;
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const contract = await deployEncryptedERC1155Fixture();
    this.contractAddress = await contract.getAddress();
    this.erc1155 = contract;
    //contractInstance = contract;
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);
  });

  it.only("should mint the contract", async function () {
    const encryptedData1 = this.instances.alice.encrypt32(777);
    const encryptedData2 = this.instances.alice.encrypt32(778);
    const encryptedData3 = this.instances.alice.encrypt32(779);
    const encryptedData4 = this.instances.alice.encrypt32(780);
    const encryptedDataArray = [encryptedData1, encryptedData2, encryptedData3, encryptedData4];
    const transaction = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      1000,
      encryptedDataArray,
      encryptedData1,
    );
    await transaction.wait();
    const balance = await this.erc1155.balanceOf(this.signers.alice.address, 0);
    expect(balance).to.equal(1000);
  });

  it("should access confidential data", async function () {
    const encryptedData1 = this.instances.alice.encrypt32(787);
    const encryptedData2 = this.instances.alice.encrypt32(788);
    const encryptedData3 = this.instances.alice.encrypt32(789);
    const encryptedData4 = this.instances.alice.encrypt32(790);
    const encryptedDataArray = [encryptedData1, encryptedData2, encryptedData3, encryptedData4];
    const transaction = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      1000,
      encryptedDataArray,
      encryptedData1,
    );
    await transaction.wait();

    const token = this.instances.alice.getPublicKey(this.contractAddress)!;

    const returnedEncryptedData = await this.erc1155.getConfidentialData(0, token.publicKey, token.signature);
    const data = this.instances.alice.decrypt(this.contractAddress, returnedEncryptedData[0]);
    expect(data).to.equal(787);
  });

  // it("should mint the contract", async function () {
  //   const encryptedData = this.instances.alice.encrypt32(777);
  //   const transaction = await this.erc1155.mintWithConfidentialData(
  //     this.signers.alice.address,
  //     0,
  //     1000,
  //     encryptedData,
  //     encryptedData,
  //   );
  //   await transaction.wait();
  //   const balance = await this.erc1155.balanceOf(this.signers.alice.address, 0);
  //   expect(balance).to.equal(1000);
  // });

  // it("should access confidential data", async function () {
  //   const encryptedData = this.instances.alice.encrypt32(787);
  //   const transaction = await this.erc1155.mintWithConfidentialData(
  //     this.signers.alice.address,
  //     0,
  //     1000,
  //     encryptedData,
  //     encryptedData,
  //   );
  //   await transaction.wait();

  //   const token = this.instances.alice.getPublicKey(this.contractAddress)!;

  //   const returnedEncryptedData = await this.erc1155.getConfidentialData(0, token.publicKey, token.signature);
  //   const data = this.instances.alice.decrypt(this.contractAddress, returnedEncryptedData);
  //   expect(data).to.equal(787);
  // });

  it("should not access confidential data", async function () {
    //    const encryptedData = this.instances.alice.encrypt32(787);
    const encryptedData1 = this.instances.alice.encrypt32(787);
    const encryptedData2 = this.instances.alice.encrypt32(788);
    const encryptedData3 = this.instances.alice.encrypt32(789);
    const encryptedData4 = this.instances.alice.encrypt32(790);
    const encryptedDataArray = [encryptedData1, encryptedData2, encryptedData3, encryptedData4];
    const transaction = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      1000,
      encryptedDataArray,
      encryptedData1,
    );
    await transaction.wait();

    const bobErc1155 = this.erc1155.connect(this.signers.bob);
    const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;
    await expect(bobErc1155.getConfidentialData(0, tokenBob.publicKey, tokenBob.signature))
      .to.be.revertedWithCustomError(bobErc1155, "RequirePositiveBalance")
      .withArgs(0);
    //const returnedEncryptedData = await bobErc1155.getConfidentialData(0, tokenBob.publicKey, tokenBob.signature);
    //const data = this.instances.bob.decrypt(this.contractAddress, returnedEncryptedData);
    //expect(data).to.equal(0);
  });

  it("should not re-mint already set confidential data", async function () {
    //    const encryptedData1 = this.instances.alice.encrypt32(787);
    const encryptedData1 = this.instances.alice.encrypt32(787);
    const encryptedData2 = this.instances.alice.encrypt32(788);
    const encryptedData3 = this.instances.alice.encrypt32(789);
    const encryptedData4 = this.instances.alice.encrypt32(790);
    const encryptedDataArray1 = [encryptedData1, encryptedData2, encryptedData3, encryptedData4];
    const transaction1 = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      1000,
      encryptedDataArray1,
      encryptedData1,
    );
    console.log("yoyo");
    await transaction1.wait();
    console.log("yoyo");

    const encryptedDataArray2 = [encryptedData4, encryptedData3, encryptedData2, encryptedData1];

    try {
      await this.erc1155.mintWithConfidentialData(
        this.signers.alice.address,
        0,
        500,
        encryptedDataArray2,
        encryptedData2,
      );
    } catch (e) {
      expect((e as Error).toString().substring(0, 67)).to.be.equal(
        "ProviderError: rpc error: code = Unknown desc = execution reverted:",
      );
      //   (e as Error).toString().substring(0, 67) ===
      //     "ProviderError: rpc error: code = Unknown desc = execution reverted",
      // ).to.be.true;
    }
    // await expect(
    //   this.erc1155.mintWithConfidentialData(this.signers.alice.address, 0, 500, encryptedData2, encryptedData2),
    // ).to.be.revertedWith("Data Already Set");

    // await expect(
    //   this.erc1155.mintWithConfidentialData(this.signers.alice.address, 0, 500, encryptedData2, encryptedData2),
    // )
    //   .to.be.revertedWithCustomError(this.erc1155, "DataAlreadySet")
    //   .withArgs(0);

    // await expect(transaction2).to.be.revertedWith("Confidential data already set for this tokenId");
    // await (await transaction2).wait();
    // await expect(
    //   this.erc1155.mintWithConfidentialData(this.signers.alice.address, 0, 500, encryptedData2, encryptedData2),
    // ).to.be.revertedWith("Confidential data already set for this tokenId");
    //await transaction2.wait();

    const balance = await this.erc1155.balanceOf(this.signers.alice.address, 0);
    expect(balance).to.equal(1000);

    // const token = this.instances.alice.getPublicKey(this.contractAddress)!;

    // const returnedEncryptedData = await this.erc1155.getConfidentialData(0, token.publicKey, token.signature);
    // const data = this.instances.alice.decrypt(this.contractAddress, returnedEncryptedData);
    // expect(data).to.equal(787);
  });

  it("should transfer tokens between two users", async function () {
    //const encryptedData = this.instances.alice.encrypt32(787);
    const encryptedData1 = this.instances.alice.encrypt32(787);
    const encryptedData2 = this.instances.alice.encrypt32(788);
    const encryptedData3 = this.instances.alice.encrypt32(789);
    const encryptedData4 = this.instances.alice.encrypt32(790);
    const encryptedDataArray = [encryptedData1, encryptedData2, encryptedData3, encryptedData4];
    const transaction = await this.erc1155.mintWithConfidentialData(
      this.signers.alice.address,
      0,
      2000,
      encryptedDataArray,
      encryptedData1,
    );
    await transaction.wait();

    const tx = await this.erc1155.safeTransferFrom(
      this.signers.alice.address,
      this.signers.bob.address,
      0,
      500,
      "0x",
      {},
    );
    await tx.wait();

    const balanceAlice = await this.erc1155.balanceOf(this.signers.alice.address, 0);
    expect(balanceAlice).to.equal(1500);

    const balanceBob = await this.erc1155.balanceOf(this.signers.bob.address, 0);
    expect(balanceBob).to.equal(500);

    // 	const bobErc20 = this.erc20.connect(this.signers.bob);

    // const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;

    // const encryptedBalanceBob = await bobErc20.balanceOf(this.signers.bob, tokenBob.publicKey, tokenBob.signature);

    // // Decrypt the balance
    // const balanceBob = this.instances.bob.decrypt(this.contractAddress, encryptedBalanceBob);

    // expect(balanceBob).to.equal(1337);
  });
});
