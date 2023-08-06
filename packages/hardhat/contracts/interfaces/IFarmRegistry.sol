//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";

interface IFarmRegistry {
    event FarmRegistered(
        bytes32 indexed uid, 
        bytes32 ownerUID, 
        string name, 
        string description, 
        string country, 
        string state, 
        string postalCode, 
        string website
    );
    event FarmRevoked(
        bytes32 indexed uid, 
        bytes32 ownerUID, 
        string name
    );

    function farmRecordByOwnerAddress(address) external view returns (FarmRecord memory);
    function farmRecordByOwnerUID(bytes32) external view returns (FarmRecord memory);
    function farmRecordByUID(bytes32) external view returns (FarmRecord memory);
    function farmRecordByName(string calldata) external view returns (FarmRecord memory);
}