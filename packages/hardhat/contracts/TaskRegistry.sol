//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import "@safe-global/safe-contracts/contracts/Safe.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ITaskRegistry.sol";
import "./interfaces/ICommunityRegistry.sol";
// import "./interfaces/IUserRegistry.sol";
// import "./interfaces/IFarmRegistry.sol";

contract TaskRegistry is ITaskRegistry, Ownable, SchemaResolver {
    string public constant communityTaskSchema = "string name,string description,address creator,uint256 startTime,uint256 endTime,bool recurring,uint256 frequency,uint256 reward";
    bytes32 public immutable communityTaskSchemaUID;
	string public constant taskStartedSchema = "uint256 taskId,uint256 communityId,address userAddress,uint256 startTime";
	bytes32 public immutable taskStartedSchemaUID;
	string public constant taskCompletedSchema = "uint256 taskId,uint256 communityId,address userAddress,uint256 completeTime";
	bytes32 public immutable taskCompletedSchemaUID;
	string public constant taskReviewSchema = "uint256 taskId,uint256 communityId,address userAddress,string comments";
	bytes32 public immutable taskReviewSchemaUID;

	ICommunityRegistry public communityRegistry;


	constructor(
		IEAS eas,
		ISchemaRegistry _schemaRegistry,
		ICommunityRegistry _communityRegistry
	) Ownable() SchemaResolver(eas) {
		communityRegistry = _communityRegistry;
		communityTaskSchemaUID = _schemaRegistry.register(communityTaskSchema, this, false);
		taskStartedSchemaUID = _schemaRegistry.register(taskStartedSchema, this, false);
		taskCompletedSchemaUID = _schemaRegistry.register(taskCompletedSchema, this, false);
		taskReviewSchemaUID = _schemaRegistry.register(taskReviewSchema, this, false);
	}

	mapping(string => bytes32) public taskUIDByNameAddressStartTime;

	// External view functions

	function taskByUID(bytes32 uid) public view returns (Task memory) {
		if (uid == bytes32(0)) {
			return Task({
				uid: bytes32(0),
				name: "",
				description: "",
				creator: address(0),
				startTime: uint(0),
				endTime: uint(0),
				recurring: false,
				frequency: uint(0),
				reward: uint(0)
			});
		}
		Attestation memory communityTaskRegistration = _eas.getAttestation(uid);
		(
			string memory name,
			string memory description,
			address _creator,
			uint _startTime,
			uint _endTime,
			bool _recurring,
			uint _frequency,
			uint _reward
		) = abi.decode(communityTaskRegistration.data, (string, string, address, uint, uint, bool, uint, uint));
		require(bytes(name).length > 0, "Invalid community task record");
		return Task({
			uid: uid,
			name: name,
			description: description,
			creator: _creator,
			startTime: _startTime,
			endTime: _endTime,
			recurring: _recurring,
			frequency: _frequency,
			reward: _reward
		});
	}

	function taskByNameCreatorStartTime(string calldata name,address creator,uint startTime) external view returns (Task memory) {
		return taskByUID(taskUIDByNameAddressStartTime[string.concat(name,toAsciiString(creator),Strings.toString(startTime))]);
	}

	function createTaskStarted(
		bytes32 taskUID, 
		address userAddress,
		uint256 timeStamp
	) external payable returns (address newTaskStarted) {
		require(taskUID != bytes32(0), "Task UID cannot be 0");
		Attestation memory communityTaskRegistration = _eas.getAttestation(taskUID);
		require(communityTaskRegistration.schema == communityTaskSchemaUID, "Invalid community task schema");


		bytes memory taskStartedData = abi.encode(
		(	TaskStarted(
				taskUID,
				userAddress,
				timeStamp
			)
		)
		);

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

	function createTaskCompleted(
		bytes32 taskUID, 
		address userAddress,
		uint256 timeStamp
	) external payable returns (address newTaskCompleted) {
		require(taskUID != bytes32(0), "Task UID cannot be 0");
		Attestation memory communityTaskRegistration = _eas.getAttestation(taskUID);
		require(communityTaskRegistration.schema == communityTaskSchemaUID, "Invalid community task schema");


		bytes memory taskCompletedData = abi.encode(
		(	TaskCompleted(
				taskUID,
				userAddress,
				timeStamp
			)
		)
		);


		
		AttestationRequestData memory requestData = AttestationRequestData({
			recipient: userAddress,
			expirationTime: 0,
			revocable: false,
			refUID: taskUID,
			data: taskCompletedData,
			value: 0
		});
		AttestationRequest memory request = AttestationRequest({
			schema: taskCompletedSchemaUID,
			data: requestData
		});
		_eas.attest{value: msg.value}(request);
	}

	function toAsciiString(address x) internal pure returns (string memory) {
    bytes memory s = new bytes(40);
    for (uint i = 0; i < 20; i++) {
        bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
        bytes1 hi = bytes1(uint8(b) / 16);
        bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
        s[2*i] = char(hi);
        s[2*i+1] = char(lo);            
    }
    return string(s);
}

function char(bytes1 b) internal pure returns (bytes1 c) {
    if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
    else return bytes1(uint8(b) + 0x57);
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
				address creator,
				uint startTime,
				uint endTime,
				bool recurring,
				uint frequency,
				uint reward
			) = abi.decode(attestation.data, (string, string, address, uint, uint, bool, uint, uint));
			require(bytes(name).length > 0, "Name cannot be empty");
			require(bytes(description).length > 0, "Description cannot be empty");
			taskUIDByNameAddressStartTime[string.concat(name,toAsciiString(creator),Strings.toString(startTime))] = attestation.uid;
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