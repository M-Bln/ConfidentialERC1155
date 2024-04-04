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
    error DataAlreadySet(uint256 tokenId);
    error RequirePositiveBalance(uint256 tokenId);
    // Mapping from token ID to additional data
    mapping(uint256 tokenId => TokenData tokenData) private _tokenDatas;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    // Function to mint new tokens with additional data
    function mintWithConfidentialData(
        address account,
        uint256 tokenId,
        uint256 amount,
        bytes calldata confidentialData,
        bytes memory metaData
    ) external onlyOwner {
        if (_tokenDatas[tokenId].alreadySet) {
            revert DataAlreadySet(tokenId);
        }
        // require(!_tokenDatas[tokenId].alreadySet, "Data Already Set");
        super._mint(account, tokenId, amount, metaData);
        _tokenDatas[tokenId] = TokenData(TFHE.asEuint32(confidentialData), true);
    }

    function getConfidentialData(
        uint256 tokenId,
        bytes32 publicKey,
        bytes calldata signature
    ) public view virtual onlySignedPublicKey(publicKey, signature) returns (bytes memory) {
        if (balanceOf(msg.sender, tokenId) <= 0) {
            revert RequirePositiveBalance(tokenId);
        }
        //require(balanceOf(msg.sender, tokenId) > 0, "Require positive balance to access confidential data");
        return TFHE.reencrypt(_tokenDatas[tokenId].x, publicKey, 0);
    }

    // Function to get the additional data associated with a token
    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        return _tokenDatas[tokenId];
    }
}
