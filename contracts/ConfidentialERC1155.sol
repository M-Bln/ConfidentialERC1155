// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "fhevm/abstracts/Reencrypt.sol";
import "fhevm/lib/TFHE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// Define a user-defined type for additional data associated with each token
struct TokenData {
    //    uint256 tokenId;
    euint32 x;
    bool alreadySet;
}

contract ConfidentialERC1155 is ERC1155, Ownable, Reencrypt {
    // Mapping from token ID to additional data
    mapping(uint256 tokenId => TokenData tokenData) private _tokenData;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    // Function to mint new tokens with additional data
    function mintWithConfidentialData(
        address account,
        uint256 tokenId,
        uint256 amount,
        bytes calldata confidentialData,
        bytes memory data
    ) external onlyOwner {
        //require(!_tokenData[tokenId].alreadySet, "Confidential data already set for this tokenId");
        if (!_tokenData[tokenId].alreadySet) {
            super._mint(account, tokenId, amount, data);
            _tokenData[tokenId] = TokenData(TFHE.asEuint32(confidentialData), true);
        }
    }

    function getConfidentialData(
        uint256 tokenId,
        bytes32 publicKey,
        bytes calldata signature
    ) public view virtual onlySignedPublicKey(publicKey, signature) returns (bytes memory) {
        if (balanceOf(msg.sender, tokenId) > 0) {
            return TFHE.reencrypt(_tokenData[tokenId].x, publicKey, 0);
        } else {
            return TFHE.reencrypt(TFHE.asEuint32(0), publicKey, 0);
        }
    }
    // Function to get the additional data associated with a token
    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        return _tokenData[tokenId];
    }
}
