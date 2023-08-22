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
        bytes32 indexed fundingUID,
        address tokenAddress,
        bool isErc1155,
        bool isErc20,
        uint256 amount,
        uint256 tokenId
    );

    event TaskApplicationSubmitted(
        bytes32 indexed taskUID,
        bytes32 indexed applicationUID,
        bytes32 indexed userUID,
        bytes32[] skillUIDs
    );

    event TaskStarted(
        bytes32 indexed taskUID,
        bytes32 indexed startedUID,
        bytes32 indexed userUID,
        uint256 startTimestamp
    );

    event TaskCompleted(
        bytes32 indexed taskUID,
        bytes32 indexed completedUID,
        bytes32 indexed userUID,
        uint256 completedTimestamp
    );

    event RewardPaid(
        bytes32 indexed taskUID,
        bytes32 indexed fundingUID,
        address tokenAddress,
        address recipient,
        uint256 amount
    );

    function shareTokens() external view returns (FarmShareTokens);
}