//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";

interface IUserRegistry {
    event UserRegistered(address indexed account, bytes32 uid, string name, bytes32 emailHash, string location, UserRole role);
    event UserUpdated(bytes32 indexed originalUID, bytes32 newUID, address account, string name, bytes32 emailHash, string location, UserRole newRole);
    event UserRevoked(address indexed account, bytes32 uid, string name, bytes32 emailHash, string location, UserRole role);
    event UserAddedSkill(bytes32 indexed userUID, bytes32 indexed skillUID, string skillName);
    event UserSkillEndorsed(bytes32 indexed userUID, bytes32 indexed endorserUID, bytes32 userSkillUID, string skillName);

    function userRegistrations(address) external view returns (bytes32);
    function userEmailHashToAddress(bytes32) external view returns (address);

    function userRecordByUID(bytes32) external view returns (UserRecord memory);
    function userRecordByAddress(address) external view returns (UserRecord memory);
    function userRecordByEmail(string calldata) external view returns (UserRecord memory);
}