//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";


interface ITaskRegistry {

    event TaskRegistered(
      bytes32 indexed uid, 
      string name, 
      string description, 
      address creator,
      uint256 startTime,
      uint256 endTime,
      bool recurring,
      uint256 frequency,
      uint256 reward
    );
}