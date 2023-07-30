//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IUserRegistry.sol";
import "./interfaces/ICommunityRegistry.sol";

contract UserRegistry is IUserRegistry, Ownable {
	ICommunityRegistry public communityRegistry;
	UserRecord[] public admins;

	// UserRecord mappings
	mapping(address => UserRecord) private _userRecordsByAddress;
	mapping(string => address) private _userAddressByEmail;

	// FarmRecord mappings
	mapping(address => FarmRecord) private _farmRecordsByOwner;
	mapping(string => address) private _farmOwnerByFarmName;

	// Attestation mappings
	mapping(address => bytes32[]) private _attestationsSentByUser;
	mapping(address => bytes32[]) private _attestationsReceivedByUser;

	modifier onlyUserAccount() {
		UserRecord memory user = _userRecordsByAddress[msg.sender];
		require(msg.sender == user.account, "Not authorized user account");
		_;
	}

	modifier onlyFarmOwner() {
		FarmRecord memory farm = _farmRecordsByOwner[msg.sender];
		require(msg.sender == farm.farmOwner, "Not authorized farm owner");
		_;
	}

	constructor() Ownable() {}

	// External view functions

    function userRecordByAddress(
		address _address
	) external view override returns (UserRecord memory) {
        return _userRecordsByAddress[_address];
    }

	function userRecordByEmail(
		string memory _email
	) external view override returns (UserRecord memory) {
        return _userRecordsByAddress[_userAddressByEmail[_email]];
    }

	function farmRecordByOwner(
		address _owner
	) external view override returns (FarmRecord memory) {
        return _farmRecordsByOwner[_owner];
    }

	function farmRecordByName(
		string memory _name
	) external view override returns (FarmRecord memory) {
        return _farmRecordsByOwner[_farmOwnerByFarmName[_name]];
    }

	// External registration functions

	function registerUserSelf(
		string memory _name,
		string memory _email,
		string memory _phone,
		string memory _location,
		UserRole _role,
		string memory _communityName
	) external returns (bool) {
		require(bytes(_email).length > 0, "Email cannot be empty");
		require(bytes(_name).length > 0, "Name cannot be empty");
		require(
			msg.sender == owner() ||
				(_role != UserRole.ADMIN && _role != UserRole.MANAGER),
			"Only owner can register admin and manager roles"
		);
		require(
			_userRecordsByAddress[msg.sender].account == address(0),
			"User address already registered"
		);
		require(
			_userAddressByEmail[_email] == address(0),
			"Email already registered"
		);
		UserRecord memory newUser = UserRecord({
			account: msg.sender,
			name: _name,
			email: _email,
			phone: _phone,
			location: _location,
			role: _role
		});
		_registerUser(newUser);
		if (_role == UserRole.ADMIN) {
			admins.push(newUser);
		}
		emit UserRegistered(newUser.account, newUser.email, newUser.role);
		if(bytes(_communityName).length > 0) {
		    communityRegistry.addUserToCommunity(newUser.account, communityRegistry.communityIdByName(_communityName));
		}
		return true;
	}

	function registerUserOnBehalfOf(
		address _userAddress,
		string memory _name,
		string memory _email,
		string memory _phone,
		string memory _location,
		UserRole _role,
		string memory _communityName
	) external returns (bool) {
		require(bytes(_email).length > 0, "Email cannot be empty");
		require(bytes(_name).length > 0, "Name cannot be empty");
		require(
			_userRecordsByAddress[_userAddress].account == address(0),
			"User address already registered"
		);
		require(
			_userAddressByEmail[_email] == address(0),
			"Email already registered"
		);
		UserRecord memory senderUser = _userRecordsByAddress[msg.sender];
		require(
			senderUser.account != address(0),
			"Only registered users can register others"
		);
		require(
			(_role != UserRole.ADMIN) ||
				msg.sender == owner() ||
				senderUser.role == UserRole.ADMIN,
			"Only owner and other admins can register new admins"
		);
		require(
			senderUser.role == UserRole.ADMIN ||
				senderUser.role == UserRole.FARMER ||
				senderUser.role == UserRole.MANAGER,
			"Only admins, farmers and managers can register users on their behalf"
		);
		UserRecord memory newUser = UserRecord({
			account: _userAddress,
			name: _name,
			email: _email,
			phone: _phone,
			location: _location,
			role: _role
		});
		_registerUser(newUser);
		emit UserRegistered(newUser.account, newUser.email, newUser.role);
		if(bytes(_communityName).length > 0) {
		    communityRegistry.addUserToCommunity(newUser.account, communityRegistry.communityIdByName(_communityName));
		}
		return true;
	}

	function registerFarm(
		address _farmOwner,
		string memory _farmName,
		string memory _description,
		string memory _location,
		string memory _imageUrl,
		string[] memory _socialAccounts,
		string memory _communityName
	) external returns (bool) {
		require(bytes(_farmName).length > 0, "Farm name cannot be empty");
		// require(bytes(_communityName).length > 0, "Community name cannot be empty");
		UserRecord memory farmerRecordMemory = _userRecordsByAddress[
			_farmOwner
		];
		require(
			farmerRecordMemory.account != address(0),
			"Farm owner is not a registered user"
		);
		require(
			farmerRecordMemory.role == UserRole.FARMER,
			"Only farmers can register as farm owners"
		);
		FarmRecord memory farmRecordMemory = _farmRecordsByOwner[_farmOwner];
		require(
			farmRecordMemory.farmOwner == address(0),
			"Farm owner already has a registered farm"
		);
		require(
			_farmOwnerByFarmName[_farmName] == address(0),
			"Farm name already exists"
		);
		UserRecord memory senderUser = _userRecordsByAddress[msg.sender];
		require(
			msg.sender == _farmOwner || senderUser.role == UserRole.ADMIN,
			"Only farm owner and admins can register farms"
		);
		uint communityId = communityRegistry
			.communitiesByName(_communityName)
			.id;
		FarmRecord memory newFarm = FarmRecord({
			farmName: _farmName,
			farmOwner: _farmOwner,
			description: _description,
			location: _location,
			imageUrl: _imageUrl,
			socialAccounts: _socialAccounts,
			communityId: communityId
		});
		_registerFarm(newFarm);
        if (bytes(_communityName).length > 0) {
			require(
				communityRegistry.communitiesByName(_communityName).treasury !=
					address(0),
				"Community does not exist"
			);
            communityRegistry.addFarmToCommunity(_farmOwner, communityId);
		}
		emit FarmRegistered(_farmName, _farmOwner, communityId);
		return true;
	}

	// External registry management functions

	function updateUserRecord(
		string memory _newName,
		string memory _newEmail,
		string memory _newPhone,
		string memory _newLocation
	) external onlyUserAccount returns (UserRecord memory) {
		require(bytes(_newName).length > 0, "Name cannot be empty");
		require(bytes(_newEmail).length > 0, "Email cannot be empty");
		UserRecord storage userRecord = _userRecordsByAddress[msg.sender];
		string memory oldEmail = userRecord.email;
		userRecord.name = _newName;
		userRecord.email = _newEmail;
		userRecord.phone = _newPhone;
		userRecord.location = _newLocation;
		if (!Strings.equal(oldEmail, _newEmail)) {
			require(
				_userAddressByEmail[_newEmail] == address(0),
				"New email already registered"
			);
			delete _userAddressByEmail[oldEmail];
			_userAddressByEmail[_newEmail] = msg.sender;
		}
		return userRecord;
	}

	function updateFarmRecord(
		string memory _newDescription,
		string memory _newLocation,
		string memory _newImageUrl,
		string[] memory _newSocialAccounts
	) external onlyFarmOwner returns (FarmRecord memory) {
		FarmRecord storage farmRecord = _farmRecordsByOwner[msg.sender];
		farmRecord.description = _newDescription;
		farmRecord.location = _newLocation;
		farmRecord.imageUrl = _newImageUrl;
		farmRecord.socialAccounts = _newSocialAccounts;
		return farmRecord;
	}

	// External admin functions

	function setCommunityRegistry(
		address _communityRegistry
	) external onlyOwner {
		communityRegistry = ICommunityRegistry(_communityRegistry);
	}

	// Internal functions

	function _registerUser(UserRecord memory _userRecord) internal {
		_userRecordsByAddress[_userRecord.account] = _userRecord;
		_userAddressByEmail[_userRecord.email] = _userRecord.account;
	}

	function _registerFarm(FarmRecord memory _farmRecord) internal {
		_farmRecordsByOwner[_farmRecord.farmOwner] = _farmRecord;
		_farmOwnerByFarmName[_farmRecord.farmName] = _farmRecord.farmOwner;
		// communitiesById[_farmRecord.communityId].farms.push(_farmRecord);
	}

}