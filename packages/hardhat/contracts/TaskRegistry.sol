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

	function createTaskStarted(
		bytes32 taskUID, 
		address memory userAddress,
		uint256 memory timeStamp
	) external returns (address newTaskStared) {
		require(taskUID != bytes32(0), "Task UID cannot be 0");
		require(bytes(userAddress).length > 0, "Initial owners cannot be empty");
		Attestation memory communityTaskRegistration = _eas.getAttestation(communityUID);
		require(communityRegistration.schema == communityTaskSchemaUID, "Invalid community task schema");
		(string memory name, , , ,) = abi.decode(communityRegistration.data, (string, string, string, string, string));


		bytes memory taskStartedData = abi.encode([], []);
		AttestationRequestData memory requestData = AttestationRequestData({
			recipient: userAddress,
			expirationTime: 0,
			revocable: false,
			refUID: taskUID,
			data: taskStartedData,
			value: 0
		});
		AttestationRequest memory request = AttestationRequest({
			schema: taskStartedSchemaUID,
			data: requestData
		});
		_eas.attest{value: msg.value}(request);
	}


	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		if (attestation.schema == communityTaskSchemaUID) {
			// Attestation is for a community Task registration
			(
				string memory name,
				string memory description,
				address memory creator,
				uint memory startTime,
				uint memory endTime,
				bool memory recurring,
				uint memory frequency,
				uint memory reward
			) = abi.decode(attestation.data, (string, string, address, uint, uint, bool, uint, uint));
			require(bytes(name).length > 0, "Name cannot be empty");
			
			taskUIDByName[name] = attestation.uid;
			emit TaskRegistered(
				attestation.uid,
				name,
				description,
				creator,
				startTime,
				endTime,
				recurring,
				frequency,
				reward
			);
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