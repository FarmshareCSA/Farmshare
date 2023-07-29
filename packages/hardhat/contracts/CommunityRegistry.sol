//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ICommunityRegistry.sol";
import "./interfaces/IUserRegistry.sol";

contract CommunityRegistry is ICommunityRegistry, Ownable {
	IUserRegistry public userRegistry;

	// Community mappings
	Community[] public communities;
	mapping(string => Community) private _communitiesByName;
	mapping(uint => Community) private _communitiesById;
	mapping(string => uint) private _communityIdsByName;
	mapping(address => uint[]) private _userToCommunityIds;

	constructor() Ownable() {}

	// External view functions

	function communitiesByName(
		string memory _name
	) external view override returns (Community memory) {
		return _communitiesByName[_name];
	}

	function communitiesById(
		uint _id
	) external view override returns (Community memory) {
		return _communitiesById[_id];
	}

    function communityIdByName(
		string memory _name
	) external view override returns (uint) {
        return _communityIdsByName[_name];
    }

	function userToCommunityIds(
		address _user
	) external view override returns (uint[] memory) {
        return _userToCommunityIds[_user];
    }

	// External registration functions

	function addUserToCommunity(
		address _newMember,
		string memory _communityName
	) external {
		require(_newMember != address(0), "Invalid address");
		require(
			userRegistry.userRecordByAddress(_newMember).account != address(0),
			"User is not registered"
		);
		require(
			bytes(_communityName).length > 0,
			"Community name cannot be empty"
		);
		require(
			_communitiesByName[_communityName].treasury != address(0),
			"Community does not exist"
		);
		if (_userToCommunityIds[_newMember].length > 0) {
			for (uint i; i < _userToCommunityIds[_newMember].length; ++i) {
				require(
					!Strings.equal(
						communities[_userToCommunityIds[_newMember][i]].name,
						_communityName
					),
					"User already in community"
				);
			}
		}
		UserRecord memory newMember = userRegistry.userRecordByAddress(
			_newMember
		);
		if (
			newMember.role != UserRole.USER && newMember.role != UserRole.DONOR
		) {
			require(
				msg.sender != newMember.account,
				"Farmers, managers and admins cannot add themselves"
			);
			UserRecord memory senderUser = userRegistry.userRecordByAddress(
				msg.sender
			);
			require(
				senderUser.role != UserRole.USER &&
					senderUser.role != UserRole.DONOR,
				"Only farmers, managers and admins can add other farmers, managers and admins"
			);
		}
		_addUserToCommunity(newMember, _communityName);
		emit UserJoinedCommunity(
			newMember.account,
			_communityName,
			newMember.role
		);
	}

	function removeUserFromCommunity(
		string memory _communityName,
		UserRole _role,
		uint256 index
	) external {
		require(
			bytes(_communityName).length > 0,
			"Community name cannot be empty"
		);
		require(
			_communitiesByName[_communityName].treasury != address(0),
			"Community does not exist"
		);
		UserRecord memory senderUser = userRegistry.userRecordByAddress(
			msg.sender
		);
		require(
			senderUser.role == UserRole.ADMIN,
			"Only admins can remove users from a community"
		);
		require(
			_role != UserRole.ADMIN,
			"Admins cannot be removed from a community"
		);
		address userToRemove = _removeUserFromCommunity(_communityName, _role, index);
		emit UserRemovedFromCommunity(userToRemove, _communityName);
	}

	// External admin functions

	function setUserRegistry(address _userRegistry) external onlyOwner {
		userRegistry = IUserRegistry(_userRegistry);
	}

	// Internal functions

	function _addUserToCommunity(
		UserRecord memory _newUser,
		string memory _communityName
	) internal {
		require(
			_communitiesByName[_communityName].treasury != address(0),
			"Community does not exist"
		);
		_userToCommunityIds[msg.sender].push(
			_communitiesByName[_communityName].id
		);
		if (_newUser.role == UserRole.USER) {
			_communitiesByName[_communityName].users.push(_newUser);
		} else if (_newUser.role == UserRole.DONOR) {
			_communitiesByName[_communityName].donors.push(_newUser);
		} else if (_newUser.role == UserRole.MANAGER) {
			_communitiesByName[_communityName].managers.push(_newUser);
		} else if (_newUser.role == UserRole.FARMER) {
			_communitiesByName[_communityName].farmers.push(_newUser);
		} else {
			revert("Invalid role");
		}
	}

    function _removeUserFromCommunity(
        string memory _communityName,
		UserRole _role,
		uint256 index
    ) internal returns (address userToRemove) {
        if (_role == UserRole.USER) {
			require(
				_communitiesByName[_communityName].users.length > index,
				"Index out of bounds"
			);
			userToRemove = _communitiesByName[_communityName]
				.users[index]
				.account;
			delete _communitiesByName[_communityName].users[index];
		} else if (_role == UserRole.DONOR) {
			require(
				_communitiesByName[_communityName].donors.length > index,
				"Index out of bounds"
			);
			userToRemove = _communitiesByName[_communityName]
				.donors[index]
				.account;
			delete _communitiesByName[_communityName].donors[index];
		} else if (_role == UserRole.FARMER) {
			require(
				_communitiesByName[_communityName].farmers.length > index,
				"Index out of bounds"
			);
			userToRemove = _communitiesByName[_communityName]
				.farmers[index]
				.account;
			delete _communitiesByName[_communityName].farmers[index];
		} else if (_role == UserRole.MANAGER) {
			require(
				_communitiesByName[_communityName].managers.length > index,
				"Index out of bounds"
			);
			userToRemove = _communitiesByName[_communityName]
				.managers[index]
				.account;
			delete _communitiesByName[_communityName].managers[index];
		} else {
			revert("Invalid role");
		}
		uint[] memory userCommunities = _userToCommunityIds[userToRemove];
		for (uint i; i < userCommunities.length; ++i) {
			if (userCommunities[i] == _communityIdsByName[_communityName]) {
				delete _userToCommunityIds[userToRemove][i];
				break;
			}
		}
    }
}