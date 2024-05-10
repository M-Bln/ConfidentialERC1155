// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "fhevm/abstracts/Reencrypt.sol";
import "fhevm/lib/TFHE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ConfidentialERC1155 is ERC1155, Ownable, Reencrypt {
    // Event to log first minting for this tokenId, when confidential data is set once and for all
    event FirstMint(uint256 tokenId, address indexed to, uint256 amount, bytes metaData);

    // Event to log further minting for this tokenId, confidential data remains the same
    event ReMint(uint256 tokenId, address indexed to, uint256 amount, bytes metaData);

    error DataAlreadySet(uint256 tokenId);
    error RequirePositiveBalance(uint256 tokenId);

    // Additional data associated with each token
    struct TokenData {
        euint32[1] confidentialData;
        address tokenOwner;
    }

    // Mapping from token ID to additional data
    mapping(uint256 tokenId => TokenData tokenData) private _tokenDatas;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    function mintWithConfidentialData(
        address account,
        uint256 tokenId,
        uint256 amount,
        bytes[] calldata confidentialData,
        bytes memory metaData
    ) external {
        // require(_tokenDatas[tokenId].tokenOwner == address(0), "Data Already Set");
        // require(confidentialData.length == 1, "Must provide one encrypted integers");
        super._mint(account, tokenId, amount, metaData);
        _tokenDatas[tokenId] = TokenData(
            [
                TFHE.asEuint32(confidentialData[0])
                // TFHE.asEuint32(confidentialData[1]),
                // TFHE.asEuint32(confidentialData[2]),
                // TFHE.asEuint32(confidentialData[3])
            ],
            msg.sender
        );
        // emit FirstMint(tokenId, account, amount, metaData);
    }

    function reMint(address account, uint256 tokenId, uint256 amount, bytes memory metaData) external {
        require(_tokenDatas[tokenId].tokenOwner == msg.sender, "This CID is owned by someone else");
        super._mint(account, tokenId, amount, metaData);
        emit ReMint(tokenId, account, amount, metaData);
    }

    function getConfidentialData(
        uint256 tokenId,
        bytes32 publicKey,
        bytes calldata signature
    ) public view virtual onlySignedPublicKey(publicKey, signature) returns (bytes[1] memory) {
        if (balanceOf(msg.sender, tokenId) < 1) {
            revert RequirePositiveBalance(tokenId);
        }
        // Create an array to hold the re-encrypted data
        bytes[1] memory reencryptedData;
        reencryptedData[0] = TFHE.reencrypt(_tokenDatas[tokenId].confidentialData[0], publicKey, 0);
        // Re-encrypt each encrypted integer
        // for (uint256 i = 0; i < 1; i++) {
        //     reencryptedData[i] = TFHE.reencrypt(_tokenDatas[tokenId].confidentialData[i], publicKey, 0);
        // }
        return reencryptedData;
    }
}
