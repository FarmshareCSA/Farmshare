//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "./interfaces/IUserRegistry.sol";
import "./interfaces/IFarmRegistry.sol";

contract FarmRegistry is IFarmRegistry, Ownable, SchemaResolver {
	string public constant registrationSchema =
		"address owner,string name,string description,string location,string websiteUrl,string imageUrl";
	bytes32 public immutable registrationSchemaUID;
	string public constant managerSchema = "bytes32 farmUID,bytes32 managerUID";
	bytes32 public immutable managerSchemaUID;

	IUserRegistry public userRegistry;

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
		managerSchemaUID = _schemaRegistry.register(
			managerSchema,
			this,
			true
		);
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
            return FarmRecord({
                farmName: "",
                farmOwner: address(0),
                description: "",
                location: "",
                websiteUrl: "",
                imageUrl: ""
            });
        }
        UserRecord memory farmOwner = userRegistry.userRecordByUID(farmOwnerUID);
        Attestation memory farmRegistration = _eas.getAttestation(farmUID);
        (
			bytes32 _ownerUID,
			string memory _name,
			string memory _description,
			string memory _location,
			string memory _websiteUrl,
			string memory _imageUrl
		) = abi.decode(
				farmRegistration.data,
				(bytes32, string, string, string, string, string)
			);
        require(_ownerUID == farmOwnerUID, "Farm owner UID mismatch");
        return FarmRecord({
            farmName: _name,
            farmOwner: farmOwner.account,
            description: _description,
            location: _location,
            websiteUrl: _websiteUrl,
            imageUrl: _imageUrl
        });
    }

    function farmRecordByUID(
        bytes32 farmUID
    ) public view override returns (FarmRecord memory) {
        if (farmUID == bytes32(0)) {
            return FarmRecord({
                farmName: "",
                farmOwner: address(0),
                description: "",
                location: "",
                websiteUrl: "",
                imageUrl: ""
            });
        }
        Attestation memory farmRegistration = _eas.getAttestation(farmUID);
        (
			bytes32 _ownerUID,
			string memory _name,
			string memory _description,
			string memory _location,
			string memory _websiteUrl,
			string memory _imageUrl
		) = abi.decode(
				farmRegistration.data,
				(bytes32, string, string, string, string, string)
			);
        UserRecord memory farmOwner = userRegistry.userRecordByUID(_ownerUID);
        return FarmRecord({
            farmName: _name,
            farmOwner: farmOwner.account,
            description: _description,
            location: _location,
            websiteUrl: _websiteUrl,
            imageUrl: _imageUrl
        });
    }

	function farmRecordByName(
		string calldata farmName
	) external view override returns (FarmRecord memory) {
        return farmRecordByUID(farmUIDByName[farmName]);
    }

	function requireFarmerOrManager(
		bytes32 farmUID,
		address account
	) public view {
		require(
			farmUIDByFarmerAddress[account] == farmUID ||
			farmUIDByManagerAddress[account] == farmUID,
			"Account not authorized for farm"
		);
	}

	// Internal SchemaResolver functions

	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		require(value == 0, "Farm and manager registration require zero value");
        if (attestation.schema == registrationSchemaUID) {
			(
				bytes32 _ownerUID,
				string memory _name,
				string memory _description,
				string memory _location,
				string memory _websiteUrl,
			) = abi.decode(
					attestation.data,
					(bytes32, string, string, string, string, string)
				);
			UserRecord memory farmer = userRegistry.userRecordByUID(_ownerUID);
			require(farmer.account != address(0), "Farmer not registered");
			require(farmer.role == UserRole.FARMER, "User must be a farmer");
			farmUIDByFarmerUID[_ownerUID] = attestation.uid;
			farmUIDByName[_name] = attestation.uid;
			farmUIDByFarmerAddress[farmer.account] = attestation.uid;
			emit FarmRegistered(
				attestation.uid,
				_ownerUID,
				_name,
				_description,
				_location,
				_websiteUrl
			);
			return true;
		} else if (attestation.schema == managerSchemaUID) {
			(bytes32 _farmUID, bytes32 _managerUID) = abi.decode(attestation.data, (bytes32, bytes32));
			requireFarmerOrManager(_farmUID, attestation.attester);
			UserRecord memory manager = userRegistry.userRecordByUID(_managerUID);
			require(manager.account != address(0), "Manager not registered");
			farmUIDByManagerAddress[manager.account] = _farmUID;
			emit FarmManagerAdded(_farmUID, _managerUID);
			return true;
		}
		return false;
	}

	function onRevoke(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		require(value == 0, "Revoking farm or manager registration requires zero value");
        if (attestation.schema == registrationSchemaUID) {
			(
				bytes32 _ownerUID,
				string memory _name,
				, , ,
			) = abi.decode(
					attestation.data,
					(bytes32, string, string, string, string, string)
				);
			require(farmUIDByFarmerUID[_ownerUID] == attestation.uid, "UID mismatch");
			require(farmUIDByName[_name] == attestation.uid, "UID mismatch");
			farmUIDByFarmerUID[_ownerUID] = bytes32(0);
			farmUIDByName[_name] = bytes32(0);
			emit FarmRevoked(attestation.uid, _ownerUID, _name);
			return true;
		} else if (attestation.schema == managerSchemaUID) {
			(bytes32 _farmUID, bytes32 _managerUID) = abi.decode(attestation.data, (bytes32, bytes32));
			requireFarmerOrManager(_farmUID, attestation.attester);
			UserRecord memory manager = userRegistry.userRecordByUID(_managerUID);
			farmUIDByManagerAddress[manager.account] = 0;
			emit FarmManagerRemoved(_farmUID, _managerUID);
			return true;
		}
        return false;
	}
}