//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";

interface IFarmRegistry {
    event FarmRegistered(
        bytes32 indexed uid, 
        bytes32 ownerUID, 
        string name, 
        string description, 
        string streetAddress,
        string city, 
        string state,
        string country, 
        string postalCode, 
        string website
    );
    event FarmRevoked(
        bytes32 indexed uid, 
        bytes32 ownerUID, 
        string name
    );
    event FarmManagerAdded(
        bytes32 indexed farmUID,
        bytes32 indexed managerUID
    );
    event FarmManagerRemoved(
        bytes32 indexed farmUID,
        bytes32 indexed managerUID
    );

    function authorizedFarmerOrManager(bytes32 farmUID, address account) external view returns (bool);
    function farmRecordByOwnerAddress(address) external view returns (FarmRecord memory);
    function farmRecordByOwnerUID(bytes32) external view returns (FarmRecord memory);
    function farmRecordByUID(bytes32) external view returns (FarmRecord memory);
    function farmRecordByName(string calldata) external view returns (FarmRecord memory);
}