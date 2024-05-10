// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "fhevm/abstracts/Reencrypt.sol";
import "fhevm/lib/TFHE.sol";

contract LightConfidentialToken {
    euint32 private confidentialData;

    function setConfidentialData(bytes calldata data) external {
        confidentialData = TFHE.asEuint32(data);
    }
}
