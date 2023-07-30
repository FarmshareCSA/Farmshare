//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import "@safe-global/safe-contracts/contracts/Safe.sol";
import "./interfaces/ICommunityRegistry.sol";
import "./interfaces/IUserRegistry.sol";

contract CommunityRegistry is ICommunityRegistry, Ownable {
	IUserRegistry public userRegistry;

	SafeProxyFactory private immutable safeProxyFactory;
	address private immutable safeSingleton;
	address private immutable safeFallbackHandler;

	// Community mappings
	Community[] public communities;
	mapping(uint => Community) private _communitiesById;
	mapping(string => uint) private _communityIdsByName;

	// Membership mappings
	mapping(address => uint[]) private _userToCommunityIds;
	mapping(uint => UserRecord[]) private _communityToUsers;
	mapping(uint => UserRecord[]) private _communityToDonors;
	mapping(uint => UserRecord[]) private _communityToManagers;
	mapping(uint => UserRecord[]) private _communityToFarmers;
    mapping(uint => FarmRecord[]) private _communityToFarms;

	constructor(
		address _safeProxyFactory,
		address _safeSingleton,
		address _safeFallbackHandler
	) Ownable() {
		safeProxyFactory = SafeProxyFactory(_safeProxyFactory);
		safeSingleton = _safeSingleton;
		safeFallbackHandler = _safeFallbackHandler;
	}

	// External view functions

	function communitiesByName(
		string memory _name
	) external view override returns (Community memory) {
		return _communitiesById[_communityIdsByName[_name]];
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

    function communityToUsers(
		uint _communityId
	) external view override returns (UserRecord[] memory) {
        return _communityToUsers[_communityId];
    }

	function communityToDonors(
		uint _communityId
	) external view override returns (UserRecord[] memory) {
        return _communityToDonors[_communityId];
    }

	function communityToManagers(
		uint _communityId
	) external view override returns (UserRecord[] memory) {
        return _communityToManagers[_communityId];
    }

	function communityToFarmers(
		uint _communityId
	) external view override returns (UserRecord[] memory) {
        return _communityToFarmers[_communityId];
    }

    function communityToFarms(
        uint _communityId
    ) external view override returns (FarmRecord[] memory) {
        return _communityToFarms[_communityId];
    }

	// External registration functions

	function registerCommunity(
		string memory _name,
		string memory _description,
		string memory _location,
		address[] memory _initialOwners
	) external returns (address payable newTreasury) {
		require(bytes(_name).length > 0, "Name cannot be empty");
		require(bytes(_description).length > 0, "Description cannot be empty");
		require(bytes(_location).length > 0, "Location cannot be empty");
		require(
			_initialOwners.length > 0,
			"Must have at least one initial owner"
		);
		require(
			_communitiesById[_communityIdsByName[_name]].treasury == address(0),
			"Community already exists"
		);
		for (uint i = 0; i < _initialOwners.length; i++) {
			UserRecord memory user = userRegistry.userRecordByAddress(
				_initialOwners[i]
			);
			require(user.account != address(0), "User does not exist");
			require(
				user.role != UserRole.USER && user.role != UserRole.DONOR,
				"Initial owners must be admins, farmers or managers"
			);
		}
		bytes memory setupData = abi.encodeWithSelector(
			Safe.setup.selector,
			_initialOwners,
			_initialOwners.length,
			address(0),
			0,
			safeFallbackHandler,
			address(0),
			0,
			address(0)
		);
		SafeProxy treasuryProxy = safeProxyFactory.createProxyWithNonce(
			safeSingleton,
			setupData,
			0
		);
		newTreasury = payable(treasuryProxy);
		uint communityId = communities.length;
		Community memory newCommunity = Community(
			communityId,
			_name,
			_description,
			_location,
			newTreasury
		);
		_communitiesById[communityId] = newCommunity;
		_communityIdsByName[_name] = communityId;
		communities.push(newCommunity);
		emit CommunityRegistered(_name, _location, msg.sender, newTreasury);
	}

	function addUserToCommunity(
		address _newMember,
		uint _communityId
	) external {
		require(_newMember != address(0), "Invalid address");
		require(
			userRegistry.userRecordByAddress(_newMember).account != address(0),
			"User is not registered"
		);
		require(
			_communitiesById[_communityId].treasury != address(0),
			"Community does not exist"
		);
		if (_userToCommunityIds[_newMember].length > 0) {
			for (uint i; i < _userToCommunityIds[_newMember].length; ++i) {
				require(
					_userToCommunityIds[_newMember][i] != _communityId,
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
		_addUserToCommunity(newMember, _communityId);
		emit UserJoinedCommunity(
			newMember.account,
			_communitiesById[_communityId].name,
			newMember.role
		);
	}

	function removeUserFromCommunity(
		uint _communityId,
		UserRole _role,
		uint256 index
	) external {
		require(
			_communitiesById[_communityId].treasury != address(0),
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
		address userToRemove = _removeUserFromCommunity(
			_communityId,
			_role,
			index
		);
		emit UserRemovedFromCommunity(userToRemove, _communitiesById[_communityId].name);
	}

	// External admin functions

	function setUserRegistry(address _userRegistry) external onlyOwner {
		userRegistry = IUserRegistry(_userRegistry);
	}

	// Internal functions

	function _addUserToCommunity(
		UserRecord memory _newUser,
		uint _communityId
	) internal {
		require(
			_communitiesById[_communityId].treasury != address(0),
			"Community does not exist"
		);
		_userToCommunityIds[msg.sender].push(
			_communityId
		);
		Community memory community = _communitiesById[_communityId];
		uint communityId = community.id;
		if (_newUser.role == UserRole.USER) {
			_communityToUsers[communityId].push(_newUser);
		} else if (_newUser.role == UserRole.DONOR) {
			_communityToDonors[communityId].push(_newUser);
		} else if (_newUser.role == UserRole.MANAGER) {
			_communityToManagers[communityId].push(_newUser);
		} else if (_newUser.role == UserRole.FARMER) {
			_communityToFarmers[communityId].push(_newUser);
		} else {
			revert("Invalid role");
		}
	}

	function _removeUserFromCommunity(
		uint _communityId,
		UserRole _role,
		uint256 index
	) internal returns (address userToRemove) {
		if (_role == UserRole.USER) {
			require(
				_communityToUsers[_communityId].length > index,
				"Index out of bounds"
			);
			userToRemove = _communityToUsers[_communityId][index].account;
			delete _communityToUsers[_communityId][index];
		} else if (_role == UserRole.DONOR) {
			require(
				_communityToDonors[_communityId].length > index,
				"Index out of bounds"
			);
			userToRemove = _communityToDonors[_communityId][index].account;
			delete _communityToDonors[_communityId][index];
		} else if (_role == UserRole.FARMER) {
			require(
				_communityToFarmers[_communityId].length > index,
				"Index out of bounds"
			);
			userToRemove = _communityToFarmers[_communityId][index].account;
			delete _communityToFarmers[_communityId][index];
		} else if (_role == UserRole.MANAGER) {
			require(
				_communityToManagers[_communityId].length > index,
				"Index out of bounds"
			);
			userToRemove = _communityToManagers[_communityId][index].account;
			delete _communityToManagers[_communityId][index];
		} else {
			revert("Invalid role");
		}
		uint[] memory userCommunities = _userToCommunityIds[userToRemove];
		for (uint i; i < userCommunities.length; ++i) {
			if (userCommunities[i] == _communityId) {
				delete _userToCommunityIds[userToRemove][i];
				break;
			}
		}
	}
}