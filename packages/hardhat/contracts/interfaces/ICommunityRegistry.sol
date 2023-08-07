//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";


interface ICommunityRegistry {

    event CommunityRegistered(
      bytes32 indexed uid, 
      string name, 
      string description, 
      string country, 
      string state, 
      string postalCode
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

  //   function communitiesByName(string memory _name) external returns (Community memory);
  //   function communitiesById(uint _id) external returns (Community memory);
  //   function communityIdByName(string memory _name) external view returns (uint);
  //   function userToCommunityIds(address _user) external view returns (uint[] memory);
  //   function communityToUsers(uint _communityId) external view returns (UserRecord[] memory);
  //   function communityToDonors(uint _communityId) external view returns (UserRecord[] memory);
  //   function communityToManagers(uint _communityId) external view returns (UserRecord[] memory);
  //   function communityToFarmers(uint _communityId) external view returns (UserRecord[] memory);
  //   function communityToFarms(uint _communityId) external view returns (FarmRecord[] memory);

  //   function registerCommunity(
	// 	string memory _name,
	// 	string memory _description,
	// 	string memory _location,
	// 	address[] memory _initialOwners
	// ) external returns (address payable newTreasury);

  //   function addUserToCommunity(
	// 	address _newMember,
	// 	uint _communityId
	// ) external;

  //   function removeUserFromCommunity(
	// 	uint _communityId,
	// 	UserRole _role,
	// 	uint256 index
	// ) external;

  //   // function addFarmToCommunity(
  //   //     address _farmOwner,
  //   //     uint _communityId
  //   // ) external;

  //   function setUserRegistry(address _userRegistry) external;
}