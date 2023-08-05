//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import "@safe-global/safe-contracts/contracts/Safe.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "./interfaces/ICommunityRegistry.sol";
import "./interfaces/IUserRegistry.sol";

contract CommunityRegistry is ICommunityRegistry, Ownable, SchemaResolver {
	string public constant registrationSchema = "string name,string description,string country,string state,string postalCode";
    bytes32 public immutable registrationSchemaUID;
	string public constant treasurySchema = "address treasury,address[] initialOwners";
	bytes32 public immutable treasurySchemaUID;

	SafeProxyFactory private immutable safeProxyFactory;
	address private immutable safeSingleton;
	address private immutable safeFallbackHandler;

	IUserRegistry public userRegistry;

	// Community mappings
	mapping(address => bytes32) public communityUIDByTreasury;
	mapping(string => bytes32) public	communityUIDByName;
	mapping(string => address) public communityTreasuryByName;
	mapping(bytes32 => bytes32) public treasuryUIDByCommunityUID;

	constructor(
		IEAS _easContract,
		ISchemaRegistry _schemaRegistry,
		IUserRegistry _userRegistry,
		address _safeProxyFactory,
		address _safeSingleton,
		address _safeFallbackHandler
	) Ownable() SchemaResolver(_easContract) {
		userRegistry = _userRegistry;
		safeProxyFactory = SafeProxyFactory(_safeProxyFactory);
		safeSingleton = _safeSingleton;
		safeFallbackHandler = _safeFallbackHandler;
		registrationSchemaUID = _schemaRegistry.register(registrationSchema, this, false);
		treasurySchemaUID = _schemaRegistry.register(treasurySchema, this, false);
	}

	// External view functions

	function communityByUID(bytes32 uid) public view returns (Community memory) {
		if (uid == bytes32(0)) {
			return Community({
				uid: bytes32(0),
				name: "",
				description: "",
				country: "",
				state: "",
				postalCode: "",
				treasury: payable(0)
			});
		}
		Attestation memory communityRegistration = _eas.getAttestation(uid);
		(
			string memory name,
			string memory description,
			string memory country,
			string memory state,
			string memory postalCode
		) = abi.decode(communityRegistration.data, (string, string, string, string, string));
		require(bytes(name).length > 0, "Invalid community record");
		address payable treasury;
		bytes32 treasuryUID = treasuryUIDByCommunityUID[uid];
		if (treasuryUID != bytes32(0)) {
			Attestation memory treasuryAttestation = _eas.getAttestation(treasuryUID);
			(treasury, ) = abi.decode(treasuryAttestation.data, (address, address[]));
		}
		return Community({
			uid: uid,
			name: name,
			description: description,
			country: country,
			state: state,
			postalCode: postalCode,
			treasury: treasury
		});
	}

	function communityByName(string calldata name) external view returns (Community memory) {
		return communityByUID(communityUIDByName[name]);
	}

	// External registration functions

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