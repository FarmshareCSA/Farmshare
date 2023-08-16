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
    string public constant taskCreationSchema = "string name,string description,address creator,uint256 startTime,uint256 endTime,bool recurring,uint256 frequency";
    bytes32 public immutable taskCreationSchemaUID;
	string public constant taskFundedSchema = "address tokenAddress,uint256 amount,uint256 tokenId";
	bytes32 public immutable taskFundedSchemaUID;
	string public constant taskStartedSchema = "uint256 taskId,uint256 communityId,address userAddress,uint256 startTimestamp";
	bytes32 public immutable taskStartedSchemaUID;
	string public constant taskCompletedSchema = "uint256 taskId,uint256 communityId,address userAddress,uint256 completeTimestamp";
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
		taskCreationSchemaUID = _schemaRegistry.register(taskCreationSchema, this, false);
		taskFundedSchemaUID = _schemaRegistry.register(taskFundedSchema, this, true);
		taskStartedSchemaUID = _schemaRegistry.register(taskStartedSchema, this, false);
		taskCompletedSchemaUID = _schemaRegistry.register(taskCompletedSchema, this, false);
		taskReviewSchemaUID = _schemaRegistry.register(taskReviewSchema, this, true);
	}

	mapping(string => bytes32) public taskUIDByName;
	mapping(bytes32 => bytes32[]) public taskRewardsByTaskUID;

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
				rewards: new TaskReward[](0)
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
			uint _frequency
		) = abi.decode(communityTaskRegistration.data, (string, string, address, uint, uint, bool, uint));
		require(bytes(name).length > 0, "Invalid community task record");
		bytes32[] memory rewardUIDs = taskRewardsByTaskUID[uid];
		TaskReward[] memory rewards = new TaskReward[](rewardUIDs.length);
		for (uint i; i < rewardUIDs.length; ++i) {
			Attestation memory rewardAttestation = _eas.getAttestation(rewardUIDs[i]);
			(address tokenAddress, uint amount, bool is1155, uint tokenId) = abi.decode(rewardAttestation.data, (address, uint, bool, uint));
			rewards[i] = TaskReward(tokenAddress, amount, is1155, tokenId);
		}
		return Task({
			uid: uid,
			name: name,
			description: description,
			creator: _creator,
			startTime: _startTime,
			endTime: _endTime,
			recurring: _recurring,
			frequency: _frequency,
			rewards: rewards
		});
	}

	function taskByName(string calldata name) external view returns (Task memory) {
		return taskByUID(taskUIDByName[name]);
	}

	function createTaskStarted(
		bytes32 taskUID,
		address userAddress,
		uint256 timeStamp
	) external payable returns (bytes32 taskStartedUID) {
		require(taskUID != bytes32(0), "Task UID cannot be 0");
		Attestation memory communityTaskRegistration = _eas.getAttestation(taskUID);
		require(communityTaskRegistration.schema == taskCreationSchemaUID, "Invalid community task schema");


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

		taskStartedUID = _eas.attest{ value: msg.value }(request);
	}

	function createTaskCompleted(
		bytes32 taskUID,
		address userAddress,
		uint256 timeStamp
	) external payable returns (bytes32 taskCompletedUID) {
		require(taskUID != bytes32(0), "Task UID cannot be 0");
		Attestation memory communityTaskRegistration = _eas.getAttestation(taskUID);
		require(communityTaskRegistration.schema == taskCreationSchemaUID, "Invalid community task schema");


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

		taskCompletedUID = _eas.attest{ value: msg.value }(request);
	}


	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		if (attestation.schema == taskCreationSchemaUID) {
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