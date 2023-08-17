//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";
import "../FarmShareTokens.sol";


interface ITaskRegistry {

    event TaskRegistered(
      bytes32 indexed taskUID, 
      bytes32 indexed communityUID,
      string name, 
      string description, 
      address creator,
      uint256 startTime,
      uint256 endTime,
      bool recurring,
      uint256 frequency
    );

    event TaskFunded(
      bytes32 indexed taskUID,
      address tokenAddress,
      bool isErc1155,
      bool isErc20,
      uint256 amount,
      uint256 tokenId
    );

    function shareTokens() external view returns (FarmShareTokens);
}