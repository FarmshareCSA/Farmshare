//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";
import "../FarmShareTokens.sol";


interface ITaskRegistry {

    event TaskRegistered(
      bytes32 indexed uid, 
      string name, 
      string description, 
      bytes32 farmUID,
      address creator,
      uint256 startTime,
      uint256 endTime,
      bool recurring,
      uint256 frequency
    );

    event TaskFunded(
      bytes32 indexed taskUID,
      address tokenAddress,
      uint256 amount,
      bool is1155,
      uint256 tokenId
    );

    function shareTokens() external view returns (FarmShareTokens);
}