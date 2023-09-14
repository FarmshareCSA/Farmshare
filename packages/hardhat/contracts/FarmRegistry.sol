//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "./interfaces/IUserRegistry.sol";
import "./interfaces/IFarmRegistry.sol";
import "./FarmShareTokens.sol";

contract FarmRegistry is IFarmRegistry, Ownable, SchemaResolver {
	string public constant registrationSchema =
		"bytes32 ownerUID,string name,string description,string streetAddress,string city,string state,string country,string postalCode,string latAndLong,string websiteUrl,string imageUrl";
	bytes32 public immutable registrationSchemaUID;
	string public constant managerSchema = "bytes32 farmUID,bytes32 managerUID";
	bytes32 public immutable managerSchemaUID;

	IUserRegistry public userRegistry;

	FarmShareTokens public shareTokens;

	mapping(bytes32 => bytes32) public farmUIDByFarmerUID;
	mapping(string => bytes32) public farmUIDByName;
	mapping(address => bytes32) public farmUIDByFarmerAddress;
	mapping(address => bytes32) public farmUIDByManagerAddress;

	constructor(
		IEAS eas,
		ISchemaRegistry _schemaRegistry,
		IUserRegistry _userRegistry
	) SchemaResolver(eas) Ownable() {
		userRegistry = _userRegistry;
		registrationSchemaUID = _schemaRegistry.register(
			registrationSchema,
			this,
			true
		);
		managerSchemaUID = _schemaRegistry.register(managerSchema, this, true);
	}

	// External view functions

	function farmRecordByOwnerAddress(
		address farmOwner
	) external view override returns (FarmRecord memory) {
		bytes32 farmerUID = userRegistry.userRegistrations(farmOwner);
		return farmRecordByOwnerUID(farmerUID);
	}

	function farmRecordByOwnerUID(
		bytes32 farmOwnerUID
	) public view override returns (FarmRecord memory) {
		bytes32 farmUID = farmUIDByFarmerUID[farmOwnerUID];
		if (farmUID == bytes32(0)) {
			return
				FarmRecord({
					farmName: "",
					farmOwner: address(0),
					description: "",
					streetAddress: "",
					city: "",
					state: "",
					country: "",
					postalCode: "",
					latAndLong: "",
					websiteUrl: "",
					imageUrl: ""
				});
		}
		UserRecord memory farmOwner = userRegistry.userRecordByUID(
			farmOwnerUID
		);
		Attestation memory farmRegistration = _eas.getAttestation(farmUID);
		(
			bytes32 _ownerUID,
			string memory _name,
			string memory _description,
			string memory _streetAddress,
			string memory _city,
			string memory _state,
			string memory _country,
			string memory _postalCode,
			string memory _latAndLong,
			string memory _websiteUrl,
			string memory _imageUrl
		) = abi.decode(
				farmRegistration.data,
				(
					bytes32,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string
				)
			);
		require(_ownerUID == farmOwnerUID, "Farm owner UID mismatch");
		return
			FarmRecord({
				farmName: _name,
				farmOwner: farmOwner.account,
				description: _description,
				streetAddress: _streetAddress,
				city: _city,
				state: _state,
				country: _country,
				postalCode: _postalCode,
				latAndLong: _latAndLong,
				websiteUrl: _websiteUrl,
				imageUrl: _imageUrl
			});
	}

	function farmRecordByUID(
		bytes32 farmUID
	) public view override returns (FarmRecord memory) {
		if (farmUID == bytes32(0)) {
			return
				FarmRecord({
					farmName: "",
					farmOwner: address(0),
					description: "",
					streetAddress: "",
					city: "",
					state: "",
					country: "",
					postalCode: "",
					latAndLong: "",
					websiteUrl: "",
					imageUrl: ""
				});
		}
		Attestation memory farmRegistration = _eas.getAttestation(farmUID);
		(
			bytes32 _ownerUID,
			string memory _name,
			string memory _description,
			string memory _streetAddress,
			string memory _city,
			string memory _state,
			string memory _country,
			string memory _postalCode,
			string memory _latAndLong,
			string memory _websiteUrl,
			string memory _imageUrl
		) = abi.decode(
				farmRegistration.data,
				(
					bytes32,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string
				)
			);
		UserRecord memory farmOwner = userRegistry.userRecordByUID(_ownerUID);
		return
			FarmRecord({
				farmName: _name,
				farmOwner: farmOwner.account,
				description: _description,
				streetAddress: _streetAddress,
				city: _city,
				state: _state,
				country: _country,
				postalCode: _postalCode,
				latAndLong: _latAndLong,
				websiteUrl: _websiteUrl,
				imageUrl: _imageUrl
			});
	}

	function farmRecordByName(
		string calldata farmName
	) external view override returns (FarmRecord memory) {
		return farmRecordByUID(farmUIDByName[farmName]);
	}

	function authorizedFarmerOrManager(
		bytes32 farmUID,
		address account
	) public view returns (bool) {
		if (
			farmUIDByFarmerAddress[account] == farmUID ||
			farmUIDByManagerAddress[account] == farmUID
		) {
			return true;
		} else {
			return false;
		}
	}

	// External owner functions

	function setShareTokens(address erc1155TokenAddress) external onlyOwner {
		require(
			ERC1155(erc1155TokenAddress).supportsInterface(
				type(IERC1155).interfaceId
			)
		);
		shareTokens = FarmShareTokens(erc1155TokenAddress);
	}

	// Internal SchemaResolver functions

	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		require(value == 0, "Farm registration requires zero value");
		require(
			attestation.schema == registrationSchemaUID,
			"Invalid attestation schema"
		);
		(
			bytes32 _ownerUID,
			string memory _name,
			string memory _description,
			string memory _streetAddress,
			string memory _city,
			string memory _state,
			string memory _country,
			string memory _postalCode,
			string memory _latAndLong,
			string memory _websiteUrl,

		) = abi.decode(
				attestation.data,
				(
					bytes32,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string,
					string
				)
			);
		require(bytes(_name).length > 0, "Farm name cannot be empty");
		require(
			farmRecordByUID(farmUIDByName[_name]).farmOwner == address(0),
			"Farm name already registered"
		);
		require(bytes(_latAndLong).length > 0, "Farm location is required");
		farmUIDByFarmerUID[_ownerUID] = attestation.uid;
		address farmerAddress = userRegistry.userRecordByUID(_ownerUID).account;
		require(farmerAddress != address(0), "Invalid owner UID");
		require(
			userRegistry.userRecordByUID(_ownerUID).role == UserRole.FARMER,
			"User must be a farmer"
		);
		farmUIDByFarmerAddress[farmerAddress] = attestation.uid;
		farmUIDByName[_name] = attestation.uid;
		emit FarmRegistered(
			attestation.uid,
			_ownerUID,
			_name,
			_description,
			_streetAddress,
			_city,
			_state,
			_country,
			_postalCode,
			_websiteUrl
		);
		return true;
	}

	function onRevoke(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		require(
			value == 0,
			"Revoking farm or manager registration requires zero value"
		);
		if (attestation.schema == registrationSchemaUID) {
			(bytes32 _ownerUID, string memory _name, , , , ) = abi.decode(
				attestation.data,
				(bytes32, string, string, string, string, string)
			);
			require(
				farmUIDByFarmerUID[_ownerUID] == attestation.uid,
				"UID mismatch"
			);
			require(farmUIDByName[_name] == attestation.uid, "UID mismatch");
			farmUIDByFarmerUID[_ownerUID] = bytes32(0);
			farmUIDByName[_name] = bytes32(0);
			emit FarmRevoked(attestation.uid, _ownerUID, _name);
			return true;
		} else if (attestation.schema == managerSchemaUID) {
			(bytes32 _farmUID, bytes32 _managerUID) = abi.decode(
				attestation.data,
				(bytes32, bytes32)
			);
			require(
				authorizedFarmerOrManager(_farmUID, attestation.attester),
				"Not authorized farmer/manager"
			);
			UserRecord memory manager = userRegistry.userRecordByUID(
				_managerUID
			);
			farmUIDByManagerAddress[manager.account] = 0;
			emit FarmManagerRemoved(_farmUID, _managerUID);
			return true;
		}
		return false;
	}
}
