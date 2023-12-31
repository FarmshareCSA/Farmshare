//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "./interfaces/ITaskRegistry.sol";
import "./interfaces/IUserRegistry.sol";
import "./interfaces/IFarmRegistry.sol";
import "./interfaces/ICommunityRegistry.sol";
import "./FarmShareTokens.sol";

contract TaskRegistry is ITaskRegistry, IERC1155Receiver, Ownable, SchemaResolver {
	using SafeERC20 for IERC20Metadata;

    string public constant taskCreationSchema = "bytes32 communityUID,string name,string description,address creator,uint256 startTime,uint256 endTime,bool recurring,uint256 frequency,string imageURL";
    bytes32 public immutable taskCreationSchemaUID;
	string public constant taskFundedSchema = "address tokenAddress,bool isErc1155,bool isErc20,uint256 amount,uint256 tokenId,string tokenName";
	bytes32 public immutable taskFundedSchemaUID;
	string public constant taskApplicationSchema = "bytes32 taskUID,bytes32 userUID,bytes32[] skillUIDs";
	bytes32 public immutable taskApplicationSchemaUID;
	string public constant taskStartedSchema = "bytes32 taskUID,bytes32 userUID,uint256 startTimestamp";
	bytes32 public immutable taskStartedSchemaUID;
	string public constant taskCompletedSchema = "bytes32 taskUID,bytes32 userUID,uint256 completeTimestamp";
	bytes32 public immutable taskCompletedSchemaUID;
	string public constant taskReviewSchema = "bytes32 taskUID,bytes32 userUID,string comments";
	bytes32 public immutable taskReviewSchemaUID;

	bytes4 public constant ERC1155_RECEIVED = 0xf23a6e61;
	bytes4 public constant ERC1155_BATCH_RECEIVED = 0xbc197c81;

	IUserRegistry public userRegistry;
	IFarmRegistry public farmRegistry;
	ICommunityRegistry public communityRegistry;
	FarmShareTokens public shareTokens;

	mapping(bytes32 => bytes32[]) public taskUIDsByCommunityUID;
	mapping(bytes32 => TaskStatus) public taskStatusByUID;
	mapping(bytes32 => bytes32[]) public taskRewardUIDsByTaskUID;
	mapping(bytes32 => address[]) public taskApplicantsByTaskUID;
	mapping(bytes32 => bytes32) public taskStartedUIDByTaskUID;
	mapping(bytes32 => bytes32) public taskCompletionUIDByTaskUID;
	mapping(bytes32 => bool) public isTaskRewardPaid;
	
	error InvalidTaskId();
	error InvalidCommunityId();
	error InvalidUserAddress();
	error UnsupportedTokenType();
	error TaskRewardAlreadyPaid();

	constructor(
		IEAS eas,
		ISchemaRegistry _schemaRegistry,
		IUserRegistry _userRegistry,
		IFarmRegistry _farmRegistry,
		ICommunityRegistry _communityRegistry
	) Ownable() SchemaResolver(eas) {
		userRegistry = _userRegistry;
		farmRegistry = _farmRegistry;
		communityRegistry = _communityRegistry;
		taskCreationSchemaUID = _schemaRegistry.register(taskCreationSchema, this, false);
		taskFundedSchemaUID = _schemaRegistry.register(taskFundedSchema, this, true);
		taskApplicationSchemaUID = _schemaRegistry.register(taskApplicationSchema, this, true);
		taskStartedSchemaUID = _schemaRegistry.register(taskStartedSchema, this, false);
		taskCompletedSchemaUID = _schemaRegistry.register(taskCompletedSchema, this, false);
		taskReviewSchemaUID = _schemaRegistry.register(taskReviewSchema, this, true);
		// shareTokens = new FarmShareTokens(_userRegistry, _farmRegistry, this);
	}


	// External view functions
	function taskByUID(bytes32 uid) public view returns (Task memory) {
		if (uid == bytes32(0)) {
			return Task({
				taskUID: bytes32(0),
				communityUID: bytes32(0),
				name: "",
				description: "",
				creator: address(0),
				startTime: 0,
				endTime: 0,
				recurring: false,
				frequency: 0,
				imageURL: "",
				rewardUIDs: new bytes32[](0),
				status: TaskStatus.NONE
			});
		}
		Attestation memory taskCreation = _eas.getAttestation(uid);
		(
			bytes32 communityUID,
			string memory name,
			string memory description,
			address creator,
			uint256 startTime,
			uint256 endTime,
			bool recurring,
			uint256 frequency,
			string memory imageURL
		) = abi.decode(taskCreation.data, (bytes32, string, string, address, uint256, uint256, bool, uint256, string));
		return Task({
			taskUID: uid,
			communityUID: communityUID,
			name: name,
			description: description,
			creator: creator,
			startTime: startTime,
			endTime: endTime,
			recurring: recurring,
			frequency: frequency,
			imageURL: imageURL,
			rewardUIDs: taskRewardUIDsByTaskUID[uid],
			status: taskStatusByUID[uid]
		});
	}


	// External funding functions

	/// Funds a task with shares from the caller's farm
	/// @dev sender must be authorized to mint shares for the farm
	/// @param taskUID the task to fund
	/// @param farmUID the farm providing the shares
	/// @param amount the amount of shares to fund with
	function fundTaskWithFarmShares(
		bytes32 taskUID,
		bytes32 farmUID,
		uint amount
	) external {
		require(
			farmRegistry.authorizedFarmerOrManager(farmUID, msg.sender), 
			"Only farmer or manager can mint farm shares"
		);
		uint tokenId = uint(farmUID);
		shareTokens.mint(address(this), tokenId, amount, abi.encode(taskUID));
	}

	/// Funds a task with an ERC-20 token
	/// @dev sender must have already approved this contract for the amount
	/// @param taskUID the task to fund
	/// @param tokenAddress the token to fund it with
	/// @param amount the amount of tokens to fund with
	function fundTaskWithERC20(
		bytes32 taskUID,
		address tokenAddress,
		uint amount
	) external returns (bytes32 taskFundedUID) {
		IERC20Metadata token = IERC20Metadata(tokenAddress);
		token.safeTransferFrom(msg.sender, address(this), amount);
		bytes memory taskFundedData = abi.encode(
			tokenAddress,	// tokenAddress
			false,			// isErc1155
			true,			// isErc20
			amount,			// amount
			0,				// tokenId
			token.name()	// token name
		);
		AttestationRequestData memory requestData = AttestationRequestData({
			recipient: msg.sender,
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
		taskFundedUID = _eas.attest(request);
		taskRewardUIDsByTaskUID[taskUID].push(taskFundedUID);
	}

	// External ERC-1155 Receiver functions

	function supportsInterface(bytes4 interfaceID) external pure override returns (bool) {
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
		require(taskByUID(taskUID).creator != address(0), "Invalid task UID");
		bytes memory taskFundedData = abi.encode(
			msg.sender,	// tokenAddress
			true,		// isErc1155
			false,		// isErc20
			_value,		// amount
			_id,		// tokenId
			shareTokens.name(_id)	// token name
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
		bytes32 taskFundedUID = _eas.attest(request);
		taskRewardUIDsByTaskUID[taskUID].push(taskFundedUID);
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

	// External admin functions

	function setFarmShareTokens(FarmShareTokens _shares) external onlyOwner {
		shareTokens = _shares;
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
				bytes32 communityUID,
				string memory name,
				string memory description,
				address creator,
				uint startTime,
				uint endTime,
				bool recurring,
				uint frequency,
			) = abi.decode(attestation.data, (bytes32, string, string, address, uint, uint, bool, uint, string));
			require(bytes(name).length > 0, "Name cannot be empty");
			require(bytes(description).length > 0, "Description cannot be empty");
			require(bytes(communityRegistry.communityByUID(communityUID).name).length > 0, "Invalid community UID");
			taskUIDsByCommunityUID[communityUID].push(attestation.uid);
			taskStatusByUID[attestation.uid] = TaskStatus.CREATED;
			emit TaskRegistered(
				attestation.uid,
				communityUID,
				name,
				description,
				creator,
				startTime,
				endTime,
				recurring,
				frequency
			);
			return true;
		} else if (attestation.schema == taskFundedSchemaUID) {
			// Attestation if for a TaskFunded event
			require(attestation.attester == address(this), "Only task registry contract can attest to funding rewards");
			(
				address tokenAddress,
				bool isErc1155,
				bool isErc20,
				uint amount,
				uint tokenId,
				string memory tokenName
			) = abi.decode(attestation.data, (address, bool, bool, uint, uint, string));
			if (isErc1155 == isErc20) revert UnsupportedTokenType();
			bytes32 taskUID = attestation.refUID;
			taskRewardUIDsByTaskUID[taskUID].push(attestation.uid);
			isTaskRewardPaid[attestation.uid] = false;
			emit TaskFunded(taskUID, attestation.uid, tokenAddress, isErc1155, isErc20, amount, tokenId, tokenName);
			return true;
		} else if (attestation.schema == taskApplicationSchemaUID) {
			(
				bytes32 taskUID,
				bytes32 userUID,
				bytes32[] memory skillUIDs
			) = abi.decode(attestation.data, (bytes32, bytes32, bytes32[]));
			require(taskStatusByUID[taskUID] == TaskStatus.CREATED, "Task is either already in-progress or completed");
			UserRecord memory user = userRegistry.userRecordByUID(userUID);
			if(user.account == address(0)) revert InvalidUserAddress();
			for (uint i; i < skillUIDs.length; ++i) {
				Attestation memory userSkill = _eas.getAttestation(skillUIDs[i]);
				(
					bytes32 _skillUID,
					bytes32 _userUID
				) = abi.decode(userSkill.data, (bytes32, bytes32));
				require(_skillUID != bytes32(0), "User skill attestation not found");
				require(_userUID == userUID, "User UID does not match skill attestation");
			}
			taskApplicantsByTaskUID[taskUID].push(user.account);
			emit TaskApplicationSubmitted(taskUID, attestation.uid, userUID, skillUIDs);
			return true;
		} else if (attestation.schema == taskStartedSchemaUID) {
			(
				bytes32 taskUID,
				bytes32 userUID,
			) = abi.decode(attestation.data, (bytes32, bytes32, uint));
			require(attestation.attester == taskByUID(taskUID).creator, "Only task creator can attest that their task has been started");
			require(taskStatusByUID[taskUID] == TaskStatus.CREATED, "Task is either already in-progress or completed");
			UserRecord memory user = userRegistry.userRecordByUID(userUID);
			if(user.account == address(0)) revert InvalidUserAddress();
			taskStatusByUID[taskUID] = TaskStatus.INPROGRESS;
			taskStartedUIDByTaskUID[taskUID] = attestation.uid;
			emit TaskStarted(taskUID, attestation.uid, userUID, block.timestamp);
			return true;
		} else if (attestation.schema == taskCompletedSchemaUID) {
			(
				bytes32 taskUID,
				bytes32 userUID,
			) = abi.decode(attestation.data, (bytes32, bytes32, uint));
			require(attestation.attester == taskByUID(taskUID).creator, "Only task creator can attest that their task has been completed");
			require(taskStatusByUID[taskUID] == TaskStatus.INPROGRESS, "Task has not been started yet");
			UserRecord memory user = userRegistry.userRecordByUID(userUID);
			if(user.account != attestation.recipient) revert InvalidUserAddress();
			taskStatusByUID[taskUID] = TaskStatus.COMPLETE;
			payoutTaskRewards(taskUID, user.account);
			emit TaskCompleted(taskUID, attestation.uid, userUID, block.timestamp);
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

	function payoutTaskRewards(bytes32 taskUID, address to) internal {
		for (uint i; i < taskRewardUIDsByTaskUID[taskUID].length; ++i) {
			bytes32 rewardUID = taskRewardUIDsByTaskUID[taskUID][i];
			Attestation memory rewardAttestation = _eas.getAttestation(rewardUID);
			(
				address tokenAddress,
				bool isErc1155,
				bool isErc20,
				uint amount,
				uint tokenId,
			) = abi.decode(rewardAttestation.data, (address, bool, bool, uint, uint, string));
			if (isErc20) {
				IERC20Metadata(tokenAddress).safeTransfer(to, amount);
			} else if (isErc1155) {
				IERC1155(tokenAddress).safeTransferFrom(address(this), to, tokenId, amount, "");
			} else {
				revert UnsupportedTokenType();
			}
			emit RewardPaid(taskUID, rewardAttestation.uid, tokenAddress, to, amount);
			isTaskRewardPaid[rewardUID] = true;
		}
		taskRewardUIDsByTaskUID[taskUID] = new bytes32[](0);
	}
}