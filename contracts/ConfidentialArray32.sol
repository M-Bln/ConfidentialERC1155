// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "fhevm/abstracts/Reencrypt.sol";
import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";

contract ConfidentialArray32 {
    euint32[4] private confidentialData;

    function setConfidentialData(bytes[] calldata data) external {
        confidentialData = [
            TFHE.asEuint32(data[0]),
            TFHE.asEuint32(data[1]),
            TFHE.asEuint32(data[2]),
            TFHE.asEuint32(data[3])
        ];
    }
}
