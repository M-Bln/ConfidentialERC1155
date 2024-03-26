// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "fhevm/lib/TFHE.sol";

// Define a user-defined type for additional data associated with each token
struct TokenData {
    uint256 tokenId;
    euint32 x;
}

contract ConfidentialERC1155 is ERC1155, Ownable {
    // Mapping from token ID to additional data
    mapping(uint256 => TokenData) private _tokenData;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    // Function to mint new tokens with additional data
    function mintWithConfidentialData(
        address account,
        uint256 tokenId,
        uint256 amount,
        bytes calldata confidentialData,
        bytes memory data
    ) external onlyOwner {
        super._mint(account, tokenId, amount, data);
        _tokenData[tokenId] = TokenData(tokenId, TFHE.asEuint32(confidentialData));
    }

    // Function to get the additional data associated with a token
    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        return _tokenData[tokenId];
    }
}
