import { expect } from "chai";
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

    it("should mint the contract", async function () {
	const encryptedData = this.instances.alice.encrypt32(777);
	const transaction = await this.erc1155.mintWithConfidentialData(
	    this.signers.alice.address,
	    0,
	    1000,
	    encryptedData,
	    encryptedData,
	);
	await transaction.wait();
	const balance = await this.erc1155.balanceOf(this.signers.alice.address, 0);
	expect(balance).to.equal(1000);
    });

    it("should access confidential data", async function () {
	const encryptedData = this.instances.alice.encrypt32(787);
	const transaction = await this.erc1155.mintWithConfidentialData(
	    this.signers.alice.address,
	    0,
	    1000,
	    encryptedData,
	    encryptedData,
	);
	await transaction.wait();

	const token = this.instances.alice.getPublicKey(this.contractAddress)!;

	const returnedEncryptedData = await this.erc1155.getConfidentialData(0, token.publicKey, token.signature);
	const data = this.instances.alice.decrypt(this.contractAddress, returnedEncryptedData);
	expect(data).to.equal(787);
    });

    it("should not re-mint already set confidential data", async function () {
	const encryptedData1 = this.instances.alice.encrypt32(787);
	const transaction1 = await this.erc1155.mintWithConfidentialData(
	    this.signers.alice.address,
	    0,
	    1000,
	    encryptedData1,
	    encryptedData1,
	);
	await transaction1.wait();

	const encryptedData2 = this.instances.alice.encrypt32(42);
	const transaction2 = await this.erc1155.mintWithConfidentialData(
	    this.signers.alice.address,
	    0,
	    500,
	    encryptedData2,
	    encryptedData2,
	);
	await transaction2.wait();

	const balance = await this.erc1155.balanceOf(this.signers.alice.address, 0);
	expect(balance).to.equal(1000);
	
	const token = this.instances.alice.getPublicKey(this.contractAddress)!;

	const returnedEncryptedData = await this.erc1155.getConfidentialData(0, token.publicKey, token.signature);
	const data = this.instances.alice.decrypt(this.contractAddress, returnedEncryptedData);
	expect(data).to.equal(787);
    });
});
