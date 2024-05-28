// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "fhevm/abstracts/Reencrypt.sol";
import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";

contract ConfidentialArray {
    euint64[4] private confidentialData;

    function setConfidentialData(bytes[] calldata data) external {
        confidentialData = [
            TFHE.asEuint64(data[0]),
            TFHE.asEuint64(data[1]),
            TFHE.asEuint64(data[2]),
            TFHE.asEuint64(data[3])
        ];
    }
}
