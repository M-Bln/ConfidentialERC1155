// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

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
        euint64[4] confidentialData;
        bool alreadySet;
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
    ) external onlyOwner {
        require(!_tokenDatas[tokenId].alreadySet, "Data Already Set");
        require(confidentialData.length == 4, "Must provide four encrypted integers");
        super._mint(account, tokenId, amount, metaData);
        _tokenDatas[tokenId] = TokenData(
            [
                TFHE.asEuint64(confidentialData[0]),
                TFHE.asEuint64(confidentialData[1]),
                TFHE.asEuint64(confidentialData[2]),
                TFHE.asEuint64(confidentialData[3])
            ],
            true
        );
        emit FirstMint(tokenId, account, amount, metaData);
    }

    function reMint(address account, uint256 tokenId, uint256 amount, bytes memory metaData) external onlyOwner {
        require(_tokenDatas[tokenId].alreadySet, "Data not set yet");
        super._mint(account, tokenId, amount, metaData);
        emit ReMint(tokenId, account, amount, metaData);
    }

    function getConfidentialData(
        uint256 tokenId,
        bytes32 publicKey,
        bytes calldata signature
    ) public view virtual onlySignedPublicKey(publicKey, signature) returns (bytes[4] memory) {
        if (balanceOf(msg.sender, tokenId) < 1) {
            revert RequirePositiveBalance(tokenId);
        }
        // Create an array to hold the re-encrypted data
        bytes[4] memory reencryptedData;
        // Re-encrypt each encrypted integer
        for (uint i = 0; i < 4; i++) {
            reencryptedData[i] = TFHE.reencrypt(_tokenDatas[tokenId].confidentialData[i], publicKey, 0);
        }
        return reencryptedData;
    }
}
//     function getConfidentialData(
//         uint256 tokenId,
//         bytes32 publicKey,
//         bytes calldata signature
//     ) public view virtual onlySignedPublicKey(publicKey, signature) returns (bytes[4] memory) {
//         if (balanceOf(msg.sender, tokenId) <= 0) {
//             revert RequirePositiveBalance(tokenId);
//         }
//         //require(balanceOf(msg.sender, tokenId) > 0, "Require positive balance to access confidential data");
//         return TFHE.reencrypt(_tokenDatas[tokenId].x, publicKey, 0);
//     }

//     // Function to get the additional data associated with a token
//     function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
//         return _tokenDatas[tokenId];
//     }
// }
