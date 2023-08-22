//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";


interface ICommunityRegistry {

    event CommunityRegistered(
      bytes32 indexed uid, 
      string name, 
      string description, 
      string city, 
      string state, 
      string country,
      string postalCode,
      string website
    );
    event CommunityTreasuryCreated(
      bytes32 indexed uid, 
      string communityName, 
      bytes32 communityUID, 
      address treasury, 
      address[] initialOwners
    );
    event UserJoinedCommunity(address user, string communityName, UserRole role);
    event UserRemovedFromCommunity(address user, string communityName);
    event FarmJoinedCommunity(address farmOwner, string farmName, string communityName);

    function communityByUID(bytes32 uid) external view returns (Community memory);
    function communityByName(string calldata name) external view returns (Community memory);

    function createTreasury(
        bytes32 communityUID, 
        address[] memory initialOwners
	  ) external payable returns (address newTreasury);

    function setUserRegistry(address _userRegistry) external;
}