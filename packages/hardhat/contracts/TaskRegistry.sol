//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "./interfaces/ITaskRegistry.sol";
import "./interfaces/IUserRegistry.sol";
import "./interfaces/IFarmRegistry.sol";
import "./FarmShareTokens.sol";

contract TaskRegistry is ITaskRegistry, IERC1155Receiver, Ownable, SchemaResolver {
    string public constant taskCreationSchema = "string name,string description,address creator,uint256 startTime,uint256 endTime,bool recurring,uint256 frequency";
    bytes32 public immutable taskCreationSchemaUID;
	string public constant taskFundedSchema = "address tokenAddress,uint256 amount,bool is1155,uint256 tokenId";
	bytes32 public immutable taskFundedSchemaUID;
	string public constant taskStartedSchema = "uint256 taskId,uint256 communityId,address userAddress,uint256 startTimestamp";
	bytes32 public immutable taskStartedSchemaUID;
	string public constant taskCompletedSchema = "uint256 taskId,uint256 communityId,address userAddress,uint256 completeTimestamp";
	bytes32 public immutable taskCompletedSchemaUID;
	string public constant taskReviewSchema = "uint256 taskId,uint256 communityId,address userAddress,string comments";
	bytes32 public immutable taskReviewSchemaUID;

	bytes4 public constant ERC1155_RECEIVED = 0xf23a6e61;
	bytes4 public constant ERC1155_BATCH_RECEIVED = 0xbc197c81;

	IUserRegistry public userRegistry;
	IFarmRegistry public farmRegistry;

	FarmShareTokens public shareTokens;

	constructor(
		IEAS eas,
		ISchemaRegistry _schemaRegistry,
		IUserRegistry _userRegistry,
		IFarmRegistry _farmRegistry
	) Ownable() SchemaResolver(eas) {
		userRegistry = _userRegistry;
		farmRegistry = _farmRegistry;
		taskCreationSchemaUID = _schemaRegistry.register(taskCreationSchema, this, false);
		taskFundedSchemaUID = _schemaRegistry.register(taskFundedSchema, this, true);
		taskStartedSchemaUID = _schemaRegistry.register(taskStartedSchema, this, false);
		taskCompletedSchemaUID = _schemaRegistry.register(taskCompletedSchema, this, false);
		taskReviewSchemaUID = _schemaRegistry.register(taskReviewSchema, this, true);
		shareTokens = new FarmShareTokens(_userRegistry, _farmRegistry, this);
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
		Attestation memory farmTaskRegistration = _eas.getAttestation(uid);
		(
			string memory name,
			string memory description,
			address _creator,
			uint _startTime,
			uint _endTime,
			bool _recurring,
			uint _frequency
		) = abi.decode(farmTaskRegistration.data, (string, string, address, uint, uint, bool, uint));
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
		Attestation memory farmTaskRegistration = _eas.getAttestation(taskUID);
		require(farmTaskRegistration.schema == taskCreationSchemaUID, "Invalid community task schema");


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
		Attestation memory farmTaskRegistration = _eas.getAttestation(taskUID);
		require(farmTaskRegistration.schema == taskCreationSchemaUID, "Invalid community task schema");


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

	// External ERC-1155 Receiver functions

	function supportsInterface(bytes4 interfaceID) external view override returns (bool) {
      	return  interfaceID == 0x01ffc9a7 ||    // ERC-165 support (i.e. `bytes4(keccak256('supportsInterface(bytes4)'))`).
              	interfaceID == 0x4e2312e0;      // ERC-1155 `ERC1155TokenReceiver` support (i.e. `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)")) ^ bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`).
  	}

	function onERC1155Received(
		address _operator,
		address _from,
		uint256 _id,
		uint256 _value,
		bytes calldata _data
	) public override returns (bytes4) {
		bytes32 taskUID = abi.decode(_data, (bytes32));
		require(taskUID != bytes32(0), "Invalid task UID");
		
		bytes memory taskFundedData = abi.encode(
			TaskReward(
				msg.sender,
				_value,
				true,
				_id
			)
		);
		AttestationRequestData memory requestData = AttestationRequestData({
			recipient: tx.origin,
			expirationTime: 0,
			revocable: true,
			refUID: taskUID,
			data: taskFundedData,
			value: 0
		});
		AttestationRequest memory request = AttestationRequest({
			schema: taskFundedSchemaUID,
			data: requestData
		});
		bytes32 tokenFundedUID = _eas.attest(request);
		taskRewardsByTaskUID[taskUID].push(tokenFundedUID);
		return ERC1155_RECEIVED;
	}

	function onERC1155BatchReceived(
		address _operator,
		address _from,
		uint256[] calldata _ids,
		uint256[] calldata _values,
		bytes calldata _data
	) external returns (bytes4) {
		require(_ids.length == _values.length, "Array length mismatch");
		for (uint i; i < _ids.length; ++i) {
			require(
				onERC1155Received(
					_operator,
					_from,
					_ids[i],
					_values[i],
					_data
				) == ERC1155_RECEIVED
			);
		}
		return ERC1155_BATCH_RECEIVED;
	}

	// Internal SchemaResolver functions

	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		require(value == 0, "Task attestations must have zero ETH value");
		if (attestation.schema == taskCreationSchemaUID) {
			// Attestation is for a FarmTask registration
			(
				string memory name,
				string memory description,
				address creator,
				uint startTime,
				uint endTime,
				bool recurring,
				uint frequency,
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
				frequency
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