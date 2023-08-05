//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";

interface IUserRegistry {
    event UserRegistered(address indexed account, bytes32 uid, string name, string email, string phone, string location, UserRole role);
    event UserRevoked(address indexed account, bytes32 uid, string name, string email, string phone, string location, UserRole role);

    function userRegistrations(address) external view returns (bytes32);
    function userEmailToAddress(string calldata) external view returns (address);

    function userRecordByUID(bytes32) external view returns (UserRecord memory);
    function userRecordByAddress(address) external view returns (UserRecord memory);
    function userRecordByEmail(string calldata) external view returns (UserRecord memory);
}