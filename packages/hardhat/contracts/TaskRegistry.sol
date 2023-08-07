//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import "@safe-global/safe-contracts/contracts/Safe.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "./interfaces/ITaskRegistry.sol";
import "./interfaces/ICommunityRegistry.sol";
// import "./interfaces/IUserRegistry.sol";
// import "./interfaces/IFarmRegistry.sol";

contract TaskRegistry is ITaskRegistry, Ownable, SchemaResolver {
    string public constant communityTaskSchema = "string name,string description,address creator,uint256 startTime,uint256 endTime,bool recurring,uint256 frequency,uint256 reward";
    bytes32 public immutable communityTaskSchemaUID;
	string public constant taskStartedSchema = "uint256 taskId, uint256 communityId, address userAddress , uint256 timeStamp";
	bytes32 public immutable taskStartedSchemaUID;
	string public constant taskCompletedSchema = "uint256 taskId, uint256 communityId, address userAddress , uint256 timeStamp";
	bytes32 public immutable taskCompletedSchemaUID;
	string public constant taskReviewSchema = "uint256 taskId, uint256 communityId, address userAddress , string comments";
	bytes32 public immutable taskCompletedSchemaUID;

	ICommunityRegistry public communityRegistry;



	constructor(
		IEAS eas,
		ISchemaRegistry _schemaRegistry,
		ICommunityRegistry _communityRegistry
	) Ownable() SchemaResolver(_easContract) {
		communityRegistry = _communityRegistry;
		farmRegistry = _farmRegistry;
		communityTaskSchemaUID = _schemaRegistry.register(communityTaskSchema, this, false);
		taskStartedSchemaUID = _schemaRegistry.register(taskStartedSchema, this, false);
		taskCompletedSchemaUID = _schemaRegistry.register(taskCompletedSchema, this, false);
		taskReviewSchemaUID = _schemaRegistry.register(taskReviewSchema, this, false);
	}

	mapping(string => bytes32) public communityUIDByName;

	// External view functions

	function taskByUID(bytes32 uid) public view returns (Task memory) {
		if (uid == bytes32(0)) {
			return Task({
				uid: bytes32(0),
				name: "",
				description: "",
				creator: address(0),
				startTime: bytes32(0),
				endTime: bytes32(0),
				recurring: false,
				frequency: bytes32(0),
				reward: bytes32(0)
			});
		}
		Attestation memory communityTaskRegistration = _eas.getAttestation(uid);
		(
			string memory name,
			string memory description,
			address memory creator,
			uint memory startTime,
			uint memory endTime,
			bool memory recurring,
			uint memory frequency,
			uint memory reward
		) = abi.decode(communityTaskRegistration.data, (string, string, address, uint, uint, bool, uint, uint));
		require(bytes(name).length > 0, "Invalid community task record");
		return Task({
			uid: uid,
			name: name,
			description: description,
			creator: creator,
			startTime: startTime,
			endTime: endTime,
			recurring: recurring,
			frequency: frequency,
			reward: reward
		});
	}

	function taskByName(string calldata name) external view returns (Task memory) {
		return taskByUID(taskUIDByName[name]);
	}

	// External registration functions


//here
	function createTreasury(
		bytes32 communityUID, 
		address[] memory initialOwners
	) external payable returns (address newTreasury) {
		require(communityUID != bytes32(0), "Community UID cannot be 0");
		require(initialOwners.length > 0, "Initial owners cannot be empty");
		Attestation memory communityRegistration = _eas.getAttestation(communityUID);
		require(communityRegistration.schema == registrationSchemaUID, "Invalid community registration schema");
		(string memory name, , , ,) = abi.decode(communityRegistration.data, (string, string, string, string, string));
		require(communityTreasuryByName[name] == address(0), "Community treasury already exists");
		bytes memory setupData = abi.encodeWithSelector(
			Safe.setup.selector,
			initialOwners,
			initialOwners.length,
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
			uint256(communityUID)
		);
		newTreasury = payable(treasuryProxy);
		communityTreasuryByName[name] = newTreasury;
		communityUIDByTreasury[newTreasury] = communityUID;
		bytes memory treasuryData = abi.encode(newTreasury, initialOwners);
		AttestationRequestData memory requestData = AttestationRequestData({
			recipient: newTreasury,
			expirationTime: 0,
			revocable: false,
			refUID: communityUID,
			data: treasuryData,
			value: 0
		});
		AttestationRequest memory request = AttestationRequest({
			schema: treasurySchemaUID,
			data: requestData
		});
		_eas.attest{value: msg.value}(request);
	}

	// function addUserToCommunity(
	// 	address _newMember,
	// 	uint _communityId
	// ) external {}

	// function removeUserFromCommunity(
	// 	uint _communityId,
	// 	UserRole _role,
	// 	uint256 index
	// ) external {}

	function isPayable() public pure override returns (bool) {
		return true;
	}

	// External admin functions

	function setUserRegistry(address _userRegistry) external onlyOwner {
		userRegistry = IUserRegistry(_userRegistry);
	}

	// Internal functions

	function _addUserToCommunity(
		UserRecord memory _newUser,
		uint _communityId
	) internal {}

	function _removeUserFromCommunity(
		uint _communityId,
		UserRole _role,
		uint256 index
	) internal returns (address userToRemove) {}

	receive() external payable virtual override {}

	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		if (attestation.schema == registrationSchemaUID) {
			// Attestation is for a community registration
			require(value == 0, "Community registration requires zero value");
			(
				string memory name, 
				string memory description, 
				string memory country, 
				string memory state, 
				string memory postalCode
			) = abi.decode(attestation.data, (string,string,string,string,string));
			require(bytes(name).length > 0, "Name cannot be empty");
			require(communityUIDByName[name] == bytes32(0), "Community name already exists");
			require(bytes(description).length > 0, "Description cannot be empty");
			require(bytes(country).length > 0, "Country cannot be empty");
			require(bytes(postalCode).length > 0, "Postal code cannot be empty");
			communityUIDByName[name] = attestation.uid;
			emit CommunityRegistered(attestation.uid, name, description, country, state, postalCode);
			return true;
		} else if (attestation.schema == treasurySchemaUID) {
			// Attestation is for a new community treasury
			(
				address treasury,
				address[] memory initialOwners
			) = abi.decode(attestation.data, (address, address[]));
			require(treasury != address(0) && initialOwners.length > 0, "Invalid treasury data");
			treasuryUIDByCommunityUID[attestation.refUID] = attestation.uid;
			communityUIDByTreasury[treasury] = attestation.refUID;
			Attestation memory communityRegistration = _eas.getAttestation(attestation.refUID);
			(string memory name, , , ,) = abi.decode(communityRegistration.data, (string, string, string, string, string));
			emit CommunityTreasuryCreated(attestation.uid, name, attestation.refUID, treasury, initialOwners);
			if (value > 0) {
				require(msg.value == value, "Message value mismatch");
				(bool success,) = treasury.call{value: value}("");
				require(success, "Value transfer to treasury failed");
			}
			return true;
		} 
		return false;
	}

	function onRevoke(
		Attestation calldata,
		uint256
	) internal virtual override returns (bool) {
		return false;
	}
}