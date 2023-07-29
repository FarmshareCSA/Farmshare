//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";


interface ICommunityRegistry {

    event CommunityRegistered(string name, string location, address creator, address treasury);
    event UserJoinedCommunity(address user, string communityName, UserRole role);
    event UserRemovedFromCommunity(address user, string communityName);

    function communitiesByName(string memory _name) external returns (Community memory);
    function communitiesById(uint _id) external returns (Community memory);
    function communityIdByName(string memory _name) external view returns (uint);
    function userToCommunityIds(address _user) external view returns (uint[] memory);

    function addUserToCommunity(
		address _newMember,
		string memory _communityName
	) external;

    function removeUserFromCommunity(
		string memory _communityName,
		UserRole _role,
		uint256 index
	) external;

    function setUserRegistry(address _userRegistry) external;
}